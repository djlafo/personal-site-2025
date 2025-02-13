'use server'

import db from "@/db";
import { pollOptionsTable, pollsTable, pollVotesTable } from "@/db/schema/polls";
import { getClientIdentifier, getUser } from "@/lib/sessions";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { SerializedPoll, SerializedPollOption, SerializedPollVotes } from "./types";
import { MyError } from "@/lib/myerror";


function serializePoll(p: typeof pollsTable.$inferSelect, yours=false): SerializedPoll {
    return {
        uuid: p.uuid,
        title: p.title,
        guestAddable: p.guestAddable,
        dateCreated: p.dateCreated,
        yours: yours,
        rankedChoice: p.rankedChoice
    };
}

export async function listPolls() {
    const user = await getUser();
    let polls;
    if(!user) {
        polls = await db.select().from(pollsTable).where(or(
                eq(pollsTable.uuid, 'example'),
                eq(pollsTable.uuid, 'example2')
            )
        ).orderBy(desc(pollsTable.dateCreated))
    } else if(user.username === 'dylan') {
        polls = await db.select().from(pollsTable).where(eq(pollsTable.active, true)).orderBy(desc(pollsTable.dateCreated));
    } else {
        polls = await db.select().from(pollsTable).where(
            or(
                or(
                    eq(pollsTable.uuid, 'example'),
                    eq(pollsTable.uuid, 'example2')
                ),
                and(
                    eq(pollsTable.userId, user.id),
                    eq(pollsTable.active, true)
                )
            )
        ).orderBy(desc(pollsTable.dateCreated))
    }

    return polls.map(p => serializePoll(p, true));
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

    if(!poll[0].polls) return new MyError({message: 'Poll not found'});

    const seen: {[key:number]: boolean} = {};
    let options = poll.filter(p => {
        if(!p.poll_options || !p.poll_options.active) return false;
        const added = Object.hasOwn(seen, p.poll_options.id);
        seen[p.poll_options.id] = true;
        return !added;
    });
    const ip = await getClientIdentifier();
    const serializedOptions = options.map(p => {
        const votes = poll.filter(p2 => p.poll_options && p2.poll_options && p2.poll_options.id === p.poll_options.id && !!p2.poll_votes);
        const serializedVotes: Array<SerializedPollVotes> = votes.map(v => {
            return {
                id: v.poll_votes?.id || -1,
                yours: !!v.poll_votes?.ip && v.poll_votes?.ip === ip,
                rank: v.poll_votes?.rank || 0
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
    if(!user) return new MyError({message: 'Not logged in', authRequired: true});
    const currentPolls = await db.select()
        .from(pollsTable)
        .where(and(
                eq(pollsTable.userId, user.id),
                eq(pollsTable.active, true)
            )
        );
    if(currentPolls.length > 20) return new MyError({message: 'Poll limit reached'});
    const newRow = await db.insert(pollsTable).values({
        uuid: crypto.randomUUID(),
        userId: user.id,
        title: formData.get('title')?.toString() || 'Error getting title'
    }).returning({
        uuid: pollsTable.uuid
    });

    if(newRow.length === 1) {
        return newRow[0].uuid;
    } else {
        return new MyError({message: 'Error creating poll'});
    }
}

export interface UpdatePollProps {
    title?: string;
    guestAddable?: boolean;
    active?: boolean;
    rankedChoice?: boolean;
}
export async function updatePoll(uuid: string, props: UpdatePollProps) {
    const user = await getUser();
    if(!user) return new MyError({message: 'Not logged in', authRequired: true});
    const updated = await db.update(pollsTable)
        .set(props)
        .where(
            and(
                eq(pollsTable.uuid, uuid), 
                eq(pollsTable.userId, user.id)
            )
        ).returning({uuid: pollsTable.uuid});
    if(updated.length !== 1) return new MyError({message: 'Poll does not exist or unauthorized'});
    
    // clear all votes attached to poll
    if(Object.keys(props).includes('rankedChoice')) {
        const sq = await db.select({id: pollOptionsTable.id}).from(pollOptionsTable).where(eq(pollOptionsTable.pollUuid, uuid));
        await db.delete(pollVotesTable).where(inArray(pollVotesTable.pollOptionId, sq.map(s => s.id))); // for now will have to do 2 queries, with and as dont seem to work
    }
    
    return readPoll(uuid);
}