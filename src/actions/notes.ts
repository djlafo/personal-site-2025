'use server'

import db from "@/db";
import { notesTable } from "@/db/schema/notes";

import { getUser } from "@/lib/sessions"
import { eq } from "drizzle-orm";

const MAXLEN = 50000000;

export async function getNotes(): Promise<Note[]> {
    const user = await getUser();
    if(!user) throw new Error('Not signed in');
    const query = await db.select().from(notesTable).where(eq(notesTable.userId, user.id));
    return query.map(q => {
        return {
            id: q.id,
            text: q.text,
            public: q.public,
            yours: true
        }
    });
}

export async function createNote(text: string): Promise<Note> {
    const user = await getUser();
    if(!user) throw new Error('Not signed in');
    if(!text) throw new Error('No text submitted');
    if(text.length > MAXLEN) throw new Error('Content over allowed size');
    const query = await db.insert(notesTable).values({
        text: text,
        userId: user.id,
        id: crypto.randomUUID()
    }).returning({
        id: notesTable.id,
        text: notesTable.text,
        public: notesTable.public
    });

    return {
        ...query[0],
        yours: true
    };
}

export async function updateNote(id: string, text: string, pub?: boolean) {
    checkNote(id);
    if(!text) throw new Error('No text submitted');
    if(text.length > MAXLEN) throw new Error('Content over allowed size');

    const props: {text: string, public?: boolean } = { text: text };
    if(pub !== undefined) props.public = pub;
    const updated = await db.update(notesTable).set(props).where(eq(notesTable.id, id)).returning();
    return updated;
}

export async function deleteNote(id: string) {
    checkNote(id);
    
    await db.delete(notesTable).where(eq(notesTable.id, id));
    return true;
}

export async function getNote(id: string) {
    return await checkNote(id, true);
}

export interface Note {
    id: string;
    text: string;
    public: boolean;
    yours: boolean;
}
async function checkNote(id: string, allowPublic = false): Promise<Note> {
    const user = await getUser();
    const note = await db.select().from(notesTable).where(eq(notesTable.id, id)).limit(1);
    if(note.length !== 1) throw new Error('Note not found');
    if((allowPublic && !note[0].public || !allowPublic) && (!user || note[0].userId !== user.id)) throw new Error('This isnt your note, what is wrong with you');
    return {
        id: note[0].id,
        text: note[0].text,
        public: note[0].public,
        yours: note[0].userId === user?.id
    };
}