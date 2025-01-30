'use server'

import { cookies } from "next/headers";

import db from "@/db";
import { pollOptionsTable, pollsTable, pollVotesTable } from "@/db/schema/polls";
import { usersTable } from '@/db/schema/users';
import { getIp, getUser } from "@/lib/sessions";
import { and, eq, isNull, or } from "drizzle-orm";

export interface SerializedPoll {
    uuid: string;
    title: string;
    guestAddable: boolean;
    dateCreated: string;
    yours: boolean;
}
function serializePoll(p: typeof pollsTable.$inferSelect, yours=false): SerializedPoll {
    return {
        uuid: p.uuid,
        title: p.title,
        guestAddable: p.guestAddable,
        dateCreated: p.dateCreated,
        yours: yours
    };
}

export async function listPolls() {
    const user = await getUser();
    let polls;
    if(!user) {
        polls = await db.select().from(pollsTable).where(
            eq(pollsTable.uuid, 'example')
        )
    } else {
        polls = await db.select().from(pollsTable).where(
            and(
                eq(pollsTable.userId, user.id),
                eq(pollsTable.active, true)
            )
        )
    }

    return polls.map(p => serializePoll(p, true));
}

export interface SerializedFullPoll extends SerializedPoll {
    options: Array<SerializedPollOption>;
}
export interface SerializedPollOption {
    id: number;
    text: string;
    votes: Array<SerializedPollVotes>;
}
export interface SerializedPollVotes {
    id: number;
    yours: boolean;
}
export async function readPoll(uuid: string) {
    const poll = await db.select()
        .from(pollsTable)
        .leftJoin(pollOptionsTable, eq(pollsTable.uuid, pollOptionsTable.pollUuid))
        .leftJoin(pollVotesTable, eq(pollOptionsTable.id, pollVotesTable.pollOptionId))
        .where(and(
            eq(pollsTable.uuid, uuid),
            eq(pollsTable.active, true)
        ));

    if(!poll[0].polls) throw new Error('fjklsafjlksdaj');

    const seen: {[key:number]: boolean} = {};
    let options = poll.filter(p => {
        if(!p.poll_options || !p.poll_options.active) return false;
        const added = Object.hasOwn(seen, p.poll_options.id);
        seen[p.poll_options.id] = true;
        return !added;
    });
    const ip = await getIp();
    const serializedOptions = options.map(p => {
        const votes = poll.filter(p2 => p.poll_options && p2.poll_options && p2.poll_options.id === p.poll_options.id && !!p2.poll_votes);
        const serializedVotes: Array<SerializedPollVotes> = votes.map(v => {
            return {
                id: v.poll_votes?.id || -1,
                yours: !!v.poll_votes?.ip && v.poll_votes?.ip === ip
            };
        });
        const pollOption: SerializedPollOption = {
            id: p.poll_options?.id || -1,
            text: p.poll_options?.text || 'Missing Text',
            votes: serializedVotes
        };
        return pollOption;
    });

    const user = await getUser();

    return {
        ...serializePoll(poll[0].polls, poll[0].polls.userId === user?.id),
        options: serializedOptions
    }
}

export async function addPoll(formData: FormData) {
    const user = await getUser();
    if(!user) throw new Error('Unauthorized');
    const currentPolls = await db.select()
        .from(pollsTable)
        .where(and(
                eq(pollsTable.userId, user.id),
                eq(pollsTable.active, true)
            )
        );
    if(currentPolls.length > 20) throw new Error('Poll limit reached');
    const newRow = await db.insert(pollsTable).values({
        uuid: crypto.randomUUID(),
        userId: user.id,
        title: formData.get('title')?.toString() || 'Error getting title'
    }).returning({
        uuid: pollsTable.uuid
    });

    if(newRow.length === 1) return newRow[0].uuid;
}

interface UpdatePollProps {
    title?: string;
    guestAddable?: boolean;
    active?: boolean;
}
export async function updatePoll(uuid: string, props: UpdatePollProps) {
    const user = await getUser();
    if(!user) throw new Error('Unauthorized');
    const updated = await db.update(pollsTable)
        .set(props)
        .where(
            and(
                eq(pollsTable.uuid, uuid), 
                eq(pollsTable.userId, user.id)
            )
        ).returning({uuid: pollsTable.uuid});
    if(updated.length === 1) return true;
    return false;

}

export async function addOption(uuid: string, text: string) {
    const user = await getUser();
    const poll = await db.select()
        .from(pollsTable)
        .leftJoin(pollOptionsTable, eq(pollsTable.uuid, pollOptionsTable.pollUuid))
        .where(eq(pollsTable.uuid, uuid));
    if(poll.length === 0 || !poll[0].polls.active) throw new Error('Poll does not exist');
    if(poll.length > 25) throw new Error('Option limit reached');
    if(!poll[0].polls.guestAddable && (user && user.id !== poll[0].polls.userId || !user)) throw new Error('You do not own this poll');

    const newRow = await db.insert(pollOptionsTable).values({
        pollUuid: uuid,
        text: text,
        userId: user && user.id || null
    }).returning({id: pollOptionsTable.id});

    return newRow.length === 1;
}

export async function updateOption(uuid: string, optionId: number, text: string, active: boolean) {
    const user = await getUser();
    if(!user) throw new Error('You dont have an account');

    const poll = await db.select().from(pollsTable).where(eq(pollsTable.uuid, uuid)).limit(1);
    if(poll.length !== 1 || !poll[0].active) throw new Error('Poll does not exist');

    let query;
    if(poll[0].userId === user.id) {
        query = await db.update(pollOptionsTable)
            .set({text: text, active: active})
            .where(
                    eq(pollOptionsTable.id, optionId),
            ).returning({id: pollOptionsTable.id});
    } else {
        query = await db.update(pollOptionsTable)
            .set({text: text, active: active})
            .where(
                and(
                    eq(pollOptionsTable.id, optionId),
                    eq(pollOptionsTable.userId, user.id)
                )
            ).returning({id: pollOptionsTable.id});
    }

    return (query.length === 1);
}

export async function voteFor(pollOptionId: number) {
    const user = await getUser();
    let ip = await getIp();
    if(!ip) return false;

    // delete any current votes
    await db.delete(pollVotesTable).where(eq(pollVotesTable.ip, ip));

    const vote = await db.insert(pollVotesTable).values({
        pollOptionId: pollOptionId,
        userId: user?.id,
        ip: ip
    }).returning({id: pollVotesTable.id});

    return vote.length === 1;
}