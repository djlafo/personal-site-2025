'use server'

import { headers } from "next/headers";

import db from "@/db";
import { pollOptionsTable, pollsTable, pollVotesTable } from "@/db/schema/polls";
import { getUser } from "@/lib/sessions";
import { and, eq } from "drizzle-orm";

export interface SerializedPoll {
    uuid: string;
    title: string;
    guestAddable: boolean;
    dateCreated: string;
}
function serializePoll(p: typeof pollsTable.$inferSelect): SerializedPoll {
    return {
        uuid: p.uuid,
        title: p.title,
        guestAddable: p.guestAddable,
        dateCreated: p.dateCreated
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

    return polls.map(p => serializePoll(p));
}

export interface SerializedFullPoll {
    options: Array<SerializedPollOption>;
    uuid: string;
    title: string;
    guestAddable: boolean;
    dateCreated: string;
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
        .innerJoin(pollOptionsTable, eq(pollsTable.uuid, pollOptionsTable.pollUuid))
        .leftJoin(pollVotesTable, eq(pollOptionsTable.id, pollVotesTable.pollOptionId))
        .where(and(
            eq(pollsTable.uuid, uuid),
            and(
                eq(pollsTable.active, true),
                eq(pollOptionsTable.active, true)
            )
        ));

    if(!poll[0].polls) throw new Error('fjklsafjlksdaj');

    const seen: {[key:number]: boolean} = {};
    let options = poll.filter(p => {
        const added = Object.hasOwn(seen, p.poll_options.id);
        seen[p.poll_options.id] = true;
        return !added;
    });
    const ip = await grabIp();
    const serializedOptions = options.map(p => {
        const votes = poll.filter(p2 => p2.poll_options.id === p.poll_options.id && !!p2.poll_votes);
        const serializedVotes: Array<SerializedPollVotes> = votes.map(v => {
            return {
                id: v.poll_votes?.id || -1,
                yours: v.poll_votes?.ip === ip
            };
        });
        const pollOption: SerializedPollOption = {
            id: p.poll_options?.id || -1,
            text: p.poll_options?.text || 'Missing Text',
            votes: serializedVotes
        };
        return pollOption;
    });

    return {
        ...serializePoll(poll[0].polls),
        options: serializedOptions
    }
}

export async function addPoll(title: string) {
    const user = await getUser();
    if(!user) throw new Error('Unauthorized');
    await db.insert(pollsTable).values({
        uuid: crypto.randomUUID(),
        userId: user.id,
        title: title
    });
}

export async function inactivatePoll(uuid: string) {
    const user = await getUser();
    if(!user) throw new Error('Unauthorized');
    const updated = await db.update(pollsTable)
        .set({active: false})
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
    const poll = await db.select().from(pollsTable).where(eq(pollsTable.uuid, uuid)).limit(1);
    if(poll.length !== 1 || !poll[0].active) throw new Error('Poll does not exist');
    if(!poll[0].guestAddable && (user && user.id !== poll[0].userId || !user)) throw new Error('You do not own this poll');

    await db.insert(pollOptionsTable).values({
        pollUuid: uuid,
        text: text,
        userId: user && user.id || null
    });
}

export async function updateOption(uuid: string, optionId: number, text: string, active: boolean) {
    const user = await getUser();
    if(!user) throw new Error('You dont have an account');

    const poll = await db.select().from(pollsTable).where(eq(pollsTable.uuid, uuid)).limit(1);
    if(poll.length !== -1 || !poll[0].active) throw new Error('Poll does not exist');

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

    return (query.length !== 1);
}

async function grabIp() {
    const headerList = await headers();
    // let ip = headerList.get('x-forwarded-for');
    // if(!ip) {
        // if(!process.env.DEVELOPMENT) {
            // throw new Error('Couldnt grab IP');
        // } else {
            const ip = '127.0.0.1';
        // }
    // }
    return ip;
}

export async function voteFor(pollOptionId: number) {
    const user = await getUser();
    const headersList = await headers();
    const ip = await grabIp();

    // delete any current votes
    await db.delete(pollVotesTable).where(eq(pollVotesTable.ip, ip));

    const vote = await db.insert(pollVotesTable).values({
        pollOptionId: pollOptionId,
        userId: user?.id,
        ip: ip
    }).returning({id: pollVotesTable.id});

    return vote.length === 1;
}