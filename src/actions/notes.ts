'use server'

import db from "@/db";
import { notesTable } from "@/db/schema/notes";

import { getUser } from "@/lib/sessions"
import { eq } from "drizzle-orm";

export async function getNotes() {
    const user = await getUser();
    if(!user) throw new Error('Not signed in');
    const query = await db.select().from(notesTable).where(eq(notesTable.userId, user.id));
    return query;
}

export async function createNote(text: string) {
    const user = await getUser();
    if(!user) throw new Error('Not signed in');
    if(!text) throw new Error('No text submitted');
    const query = await db.insert(notesTable).values({
        text: text,
        userId: user.id
    }).returning();

    return query[0];
}

export async function updateNote(id: number, text: string) {
    checkNote(id);
    
    const updated = await db.update(notesTable).set({text: text}).where(eq(notesTable.id, id)).returning();
    return updated;
}

export async function deleteNote(id: number) {
    checkNote(id);
    
    await db.delete(notesTable).where(eq(notesTable.id, id));
    return true;
}

export async function getNote(id: number) {
    return await checkNote(id, true);
}

async function checkNote(id: number, allowPublic = false) {
    const user = await getUser();
    const note = await db.select().from(notesTable).where(eq(notesTable.id, id)).limit(1);
    if(note.length !== 1) throw new Error('Note not found');
    if(!allowPublic && !note[0].public && (!user || note[0].userId !== user.id)) throw new Error('This isnt your note, what is wrong with you');
    return note[0];
}