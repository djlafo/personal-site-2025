'use server'

import { and, eq, inArray, not } from "drizzle-orm";

import { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import db from "@/db";
import { notesTable } from "@/db/schema/notes";

import { MyError } from "@/lib/myerror";
import { getUser } from "@/lib/sessions"
import { usersTable } from "@/db/schema/users";

const MAXLEN = 50000000;

export interface NoteWithFiles {
    id: string;
    parentId: string | null;
    text: string;
    public: boolean;
    username: string;
    files: string[];
}

export interface Note {
    id: string;
    parentId: string | null;
    text: string;
    public: boolean;
    username: string;
}

export async function getNote(id: string): Promise<NoteWithFiles | MyError> {
    return await checkNote(id, true);
}

export async function getNotes(): Promise<Note[] | MyError> {
    const user = await getUser();
    if(!user) return new MyError({message: 'Not signed in', authRequired: true});
    // don't bother ordering the query, it's using Ops in JSON for the text, not just regular text
    const query = await db.select().from(notesTable).innerJoin(usersTable, eq(usersTable.id, notesTable.userId)).where(eq(notesTable.userId, user.id));
    return query.map(q => {
        return {
            id: q.notes.id,
            parentId: q.notes.parentId,
            text: q.notes.text,
            public: q.notes.public,
            username: q.users.username
        }
    });
}

export async function createNote(text: string, parentId?: string): Promise<NoteWithFiles | MyError> {
    const user = await getUser();
    if(!user) return new MyError({message: 'Not signed in', authRequired: true});
    if(!text) return new MyError({message: 'No text submitted'});
    if(text.length > MAXLEN) return new MyError({message: 'Content over allowed size'});
    const query = await db.insert(notesTable).values({
        text: text,
        userId: user.id,
        parentId: parentId,
        id: crypto.randomUUID()
    }).returning({
        id: notesTable.id,
        parentId: notesTable.parentId,
        text: notesTable.text,
        public: notesTable.public
    });

    return {
        ...query[0],
        username: user.username,
        files: []
    };
}

export async function updateNote(id: string, text: string, pub?: boolean): Promise<NoteWithFiles | MyError> {
    const user = await getUser();
    if(!user) return new MyError({message: 'Not signed in', authRequired: true});
    if(!text) return new MyError({message: 'No text submitted'});
    if(text.length > MAXLEN) return new MyError({message: 'Content over allowed size'});
    
    const props: {text: string, public?: boolean } = { text: text };
    if(pub !== undefined) props.public = pub;
    const updateRequest = await db.update(notesTable).set(props).where(and(
        eq(notesTable.id, id),
        eq(notesTable.userId, user.id)
    )).returning({
        id: notesTable.id,
        parentId: notesTable.parentId,
        text: notesTable.text,
        public: notesTable.public
    });
    const fileRequest = getFilesForNote(id, user.username);

    const updated = await updateRequest;
    const files = await fileRequest;
    if(files instanceof MyError) return files;

    return {
        ...updated[0],
        username: user.username,
        files: files
    };
}

export async function addFile(id: string, fileData: FormData): Promise<NoteWithFiles | MyError> {
    // doubling up the user check because lazy and need the username here
    const user = await getUser();
    const check = await checkNote(id);
    if(check instanceof MyError) return check;

    const file = fileData.get('file') as File;
    console.log(`FILE TYPE ${file.type}`);
    const body = await file.bytes();
    const awsClient = new S3Client();
    const params = {
        Body: body,
        Bucket: process.env.AWS_BUCKET,
        Key: `${user?.username}/${id}/${file.name}`,
        ContentType: file.type,
        ContentEncoding: file.type
    }
    const command = new PutObjectCommand(params);
    try {
        await awsClient.send(command);
    } catch {
        return new MyError({message: "Failed to upload file"});
    }

    return await getNote(id);
}

export async function getFile(id: string, fileName: string): Promise<string | MyError> {
    const check = await checkNote(id, true);
    if(check instanceof MyError) return check;

    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${check.username}/${id}/${fileName}`
    };
    const command = new GetObjectCommand(params);
    const presigned = await getSignedUrl(client, command, { expiresIn: 600 });
    return presigned;
}

export async function deleteFile(id: string, fileName: string): Promise<NoteWithFiles | MyError> {
    const user = await getUser();
    const check = await checkNote(id);
    if(check instanceof MyError) return check;
    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${user?.username}/${id}/${fileName}`
    }
    const command = new DeleteObjectCommand(params);
    try {
        await client.send(command);
    } catch {
        return new MyError({message: 'Error deleting file'});
    }

    return await getNote(id);
}

export async function moveNotes(ids: string[], newParent: string): Promise<Note[] | MyError> {
    const user = await getUser();
    if(!user) return new MyError({message: 'Not signed in', authRequired: true});
    await db.update(notesTable).set({parentId: newParent || null}).where(and(
        not(eq(notesTable.id, newParent)),
        inArray(notesTable.id, ids),
        eq(notesTable.userId, user.id)
    ));
    return await getNotes();
}

export async function deleteNote(id: string) {
    const user = await getUser();
    if(!user) return new MyError({message: 'Not signed in', authRequired: true});
    await db.delete(notesTable).where(and(
        eq(notesTable.id, id),
        eq(notesTable.userId, user.id)
    ));
    return true;
}

async function checkNote(id: string, allowPublic = false): Promise<NoteWithFiles | MyError> {
    const user = await getUser();
    const note = await db.select().from(notesTable).innerJoin(usersTable, eq(usersTable.id, notesTable.userId)).where(eq(notesTable.id, id)).limit(1);
    const fileRequest = getFilesForNote(id, note[0].users.username);
    if(!allowPublic && !user) return new MyError({message: 'Not signed in', authRequired: true});
    if((allowPublic && !note[0].notes.public || !allowPublic) && (!user || note[0].notes.userId !== user.id)) return new MyError({message: 'This isnt your note, what is wrong with you'});
    if(note.length !== 1) return new MyError({message: 'Note not found'});

    const files = await fileRequest;
    if(files instanceof MyError) return files;

    return {
        id: note[0].notes.id,
        text: note[0].notes.text,
        parentId: note[0].notes.userId === user?.id ? note[0].notes.parentId : null,
        public: note[0].notes.public,
        username: note[0].users.username,
        files: files
    };
}

async function getFilesForNote(id: string, username: string) {
    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        delimiter: `${username}/${id}`
    }
    const command = new ListObjectsCommand(params);
    try {
        const resp = await client.send(command);
        if(!resp.Contents) return [];
        const files: string[] = [];
        resp.Contents.forEach(c => {
            if(c.Key) files.push(c.Key.replace(`${username}/${id}/`, ''));
        });
        return files;
    } catch {
        return new MyError({message: 'Failed to read files'});
    }
}