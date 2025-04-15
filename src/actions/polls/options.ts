'use server'

import { pollOptionsTable, pollsTable } from "@/db/schema/polls";
import { getUser } from "@/lib/sessions";
import { readPoll } from "./polls";
import { and, eq } from "drizzle-orm";
import db from "@/db";
import { MyError } from "@/lib/myerror";

export async function addOption(uuid: string, text: string) {
    const user = await getUser();
    const poll = await db.select()
        .from(pollsTable)
        .leftJoin(pollOptionsTable, eq(pollsTable.uuid, pollOptionsTable.pollUuid))
        .where(eq(pollsTable.uuid, uuid));
    if(poll.length === 0 || !poll[0].polls.active) return MyError.create({message: 'Poll does not exist'});
    if(poll.length > 25) return MyError.create({message: 'Option limit reached'});
    if(!user) return MyError.create({message: 'Not logged in', authRequired: true});
    if(!poll[0].polls.guestAddable && (user && user.id !== poll[0].polls.userId)) return MyError.create({message: 'You do not own this poll'});

    const newRow = await db.insert(pollOptionsTable).values({
        pollUuid: uuid,
        text: text,
        userId: user && user.id || null
    }).returning({id: pollOptionsTable.id});

    if(newRow.length === 1) {
        return readPoll(uuid);
    } else {
        return MyError.create({message: 'Failed creating poll'});
    }
}

export async function updateOption(uuid: string, optionId: number, text: string, active: boolean) {
    const user = await getUser();
    if(!user) return MyError.create({message: 'You dont have an account', authRequired: true});

    const poll = await db.select().from(pollsTable).where(eq(pollsTable.uuid, uuid)).limit(1);
    if(poll.length !== 1 || !poll[0].active) return MyError.create({message: 'Poll does not exist'});

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

    if(query.length === 1) {
        return readPoll(uuid);
    } else {
        return MyError.create({message: 'Failed to update'});
    }
}