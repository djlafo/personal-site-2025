'use server'

import db from "@/db";
import { pollOptionsTable, pollVotesTable } from "@/db/schema/polls";
import { getClientIdentifier, getUser } from "@/lib/sessions";
import { and, eq } from "drizzle-orm";
import { readPoll } from "./polls";
import { MyError } from "@/lib/myerror";

export async function voteFor(uuid: string, pollOptionId: number) {
    const user = await getUser();
    const ip = await getClientIdentifier();
    if(!ip) return new MyError({message: 'Failed to vote'});

    // delete any current votes
    await db.delete(pollVotesTable).where(and(
        eq(pollVotesTable.ip, ip),
        eq(pollVotesTable.pollOptionId, pollOptionId)
    ));

    const vote = await db.insert(pollVotesTable).values({
        pollOptionId: pollOptionId,
        userId: user?.id,
        ip: ip
    }).returning({id: pollVotesTable.id});

    if(vote.length === 1) {
        return readPoll(uuid);
    }  else {
        return new MyError({message: 'Failed to vote'});
    }
}

export interface RankValueType {
    rank: number;
    pollOptionId: number;
}
export async function setVoteRanks(uuid: string, values: RankValueType[]) {
    const user = await getUser();
    const ip = await getClientIdentifier();
    if(!ip) return new MyError({message: 'Failed to vote'});

    const options = await db.select().from(pollOptionsTable).where(and(
        eq(pollOptionsTable.pollUuid, uuid),
        eq(pollOptionsTable.active, true)
    ));

    const currentVotes = await db.select()
        .from(pollVotesTable)
        .fullJoin(pollOptionsTable, eq(pollVotesTable.pollOptionId, pollOptionsTable.id))
        .where(
            and( 
                eq(pollVotesTable.ip, ip),
                and(
                    eq(pollOptionsTable.pollUuid, uuid),
                    eq(pollOptionsTable.active, true)
                )
            )
        );

    // insert any votes that dont exist yet
    const newRows: any[] = [];
    options.forEach(o => {
        const ind = currentVotes.findIndex(cv => cv.poll_options?.id === o.id);
        if(ind === -1) {
            newRows.push(db.insert(pollVotesTable).values({
                pollOptionId: o.id,
                userId: user?.id,
                ip: ip,
                rank: 0
            }).returning());
        }
    });
    const all = currentVotes.map(cv => cv.poll_votes);
    const done: (typeof all)[] = await Promise.all(newRows);
    const combined = done.map(d => d[0]).concat(all);

    combined.forEach(c => {
        if(!c)return;
        const value = values.find(v => v.pollOptionId === c?.pollOptionId);
        if(value) c.rank = value.rank;
    });
    const sorted = combined.sort((a, b) => {
        if((!a?.rank && a?.rank!==0) || (!b?.rank && b?.rank!==0)) return 0;
        return a.rank - b.rank;
    });

    const updates: any = []; // way too lazy to find out whatever the type of that update is
    sorted.forEach((o, i)=> {
        if(!o?.id) return;
        updates.push(db.update(pollVotesTable).set({rank: i}).where(eq(pollVotesTable.id, o.id)));
    });
    await Promise.all(updates);

    return readPoll(uuid);
}