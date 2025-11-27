'use server'

import { and, eq, inArray, not } from "drizzle-orm";

import { S3Client, ListObjectsCommand, DeleteObjectCommand, GetObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import db from "@/db";
import { notesTable } from "@/db/schema/notes";

import { MyError, MyErrorObj } from "@/lib/myerror";
import { getUser } from "@/lib/sessions"
import { usersTable } from "@/db/schema/users";
import { MAX_FILE_SIZE, TOTAL_MAX_FILE_SIZE } from "@/app/notes/constants";
import { fileUploadsTable } from "@/db/schema/fileuploads";

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

export async function getNote(id: string): Promise<NoteWithFiles | MyErrorObj> {
    return await checkNote(id, true);
}

export async function getNotes(): Promise<Note[] | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not signed in', authRequired: true});
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

export async function createNote(text: string, parentId?: string): Promise<NoteWithFiles | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not signed in', authRequired: true});
    if(!text) return MyError.create({message: 'No text submitted'});
    if(text.length > MAXLEN) return MyError.create({message: 'Content over allowed size'});
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

export async function updateNote(id: string, text: string, pub?: boolean): Promise<NoteWithFiles | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not signed in', authRequired: true});
    if(!text) return MyError.create({message: 'No text submitted'});
    if(text.length > MAXLEN) return MyError.create({message: 'Content over allowed size'});
    
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
    if(MyError.isInstanceOf(files)) return files;

    return {
        ...updated[0],
        username: user.username,
        files: files
    };
}

export async function addFile(id: string, fileName: string, fileType: string, fileSize: number): Promise<string | MyErrorObj> {
    // doubling up the user check because lazy and need the username here
    
    const user = await getUser();
    const check = await checkNote(id);
    if(MyError.isInstanceOf(check)) return check;
    if(!user) return MyError.create({message: 'IMPOSSIBLE'}); // although checked in checkNote, for linter

    if(user.username !== 'dylan' && fileSize > MAX_FILE_SIZE) {
        return MyError.create({message: `File size larger than ${MAX_FILE_SIZE/1024/1024}mb`});
    }

    const overSize = await checkTotalFileSize(user.username, fileSize);
    if(MyError.isInstanceOf(overSize)) return overSize;
    if (!overSize) return MyError.create({message: "You've uploaded too much to my server, go away"});

    try {
        const client = new S3Client();
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: `${user.username}/${id}/${fileName}`,
            ContentType: fileType,
            ContentEncoding: fileType
        }
        const command = new CreateMultipartUploadCommand(params);
        const response = await client.send(command);
        if(!response.UploadId) return MyError.create({message: 'Empty upload ID'});
        await db.insert(fileUploadsTable).values({uploadId: response.UploadId, fileName: fileName, noteId: id, uploaded: 0, total: fileSize, partNumber: 0});
        return response.UploadId;
    } catch {
        return MyError.create({message: "Failed to create upload ID"});
    }
}

export async function addFilePart(uploadId: string, data: Uint8Array, tags: string[]): Promise<string | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not logged in', authRequired: true});
    const uploadRow = await db.select()
        .from(fileUploadsTable)
        .innerJoin(notesTable, eq(notesTable.id, fileUploadsTable.noteId))
        .where(eq(fileUploadsTable.uploadId, uploadId))
        .limit(1);
    if(uploadRow.length !== 1) return MyError.create({message: 'Cannot find upload'});
    const nextPartNo = uploadRow[0].file_uploads.partNumber + 1;
    const nextSize = uploadRow[0].file_uploads.uploaded + data.length;
    if(nextSize > uploadRow[0].file_uploads.total) {
        return MyError.create({message: 'Uploaded more data than file size'});
    }

    const key = `${user.username}/${uploadRow[0].file_uploads.noteId}/${uploadRow[0].file_uploads.fileName}`;
    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Body: data,
        Key: key,
        UploadId: uploadId,
        PartNumber: nextPartNo
    }
    const command = new UploadPartCommand(params);
    try {
        const resp = await client.send(command);
        if(!resp.ETag) return MyError.create({message: 'Empty ETag'});
        const etag = resp.ETag.replaceAll('\"', ''); // ??? why does it put quotes in it
        if(nextSize === uploadRow[0].file_uploads.total) {
            await db.delete(fileUploadsTable).where(eq(fileUploadsTable.uploadId, uploadId));
            return await completeFilePart(key, uploadId, tags.concat([etag]));
        } else {
            await db.update(fileUploadsTable).set({partNumber: nextPartNo, uploaded: uploadRow[0].file_uploads.uploaded + data.length});
            return etag;
        }
    } catch {
        return MyError.create({message: 'Error uploading part'});
    }
}

async function completeFilePart(key: string, uploadId: string, tags: string[]): Promise<string | MyErrorObj> {
    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        MultipartUpload: {
            Parts: tags.map((t, i) => { // what you know about that
                return {
                    ETag: t,
                    PartNumber: i+1
                }
            })
        },
        UploadId: uploadId
    }
    const command = new CompleteMultipartUploadCommand(params);
    try {
        await client.send(command);
        return 'done';
    } catch {
        return MyError.create({message: 'Failed to finalize file upload'});
    }
}

export async function cancelFilePart(uploadId: string, fileName: string, id: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not logged in', authRequired: true});
    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${user.username}/${id}/${fileName}`,
        UploadId: uploadId
    }
    const command = new AbortMultipartUploadCommand(params);
    try {
        await client.send(command);
        return true;
    } catch (e: any) {
        console.log(e);
        return MyError.create({message: 'Failed to cancel'});
    }
}

export async function getFile(id: string, fileName: string): Promise<string | MyErrorObj> {
    const check = await checkNote(id, true);
    if(MyError.isInstanceOf(check)) return check;

    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${check.username}/${id}/${fileName}`
    };
    const command = new GetObjectCommand(params);
    const presigned = await getSignedUrl(client, command, { expiresIn: 600 });
    return presigned;
}

export async function deleteFile(id: string, fileName: string): Promise<NoteWithFiles | MyErrorObj> {
    const user = await getUser();
    const check = await checkNote(id);
    if(MyError.isInstanceOf(check)) return check;
    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `${user?.username}/${id}/${fileName}`
    }
    const command = new DeleteObjectCommand(params);
    try {
        await client.send(command);
    } catch {
        return MyError.create({message: 'Error deleting file'});
    }

    return await getNote(id);
}

export async function moveNotes(ids: string[], newParent: string): Promise<Note[] | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not signed in', authRequired: true});
    await db.update(notesTable).set({parentId: newParent || null}).where(and(
        not(eq(notesTable.id, newParent)),
        inArray(notesTable.id, ids),
        eq(notesTable.userId, user.id)
    ));
    return await getNotes();
}

export async function deleteNote(id: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not signed in', authRequired: true});
    await db.delete(notesTable).where(and(
        eq(notesTable.id, id),
        eq(notesTable.userId, user.id)
    ));
    return true;
}

async function checkNote(id: string, allowPublic = false): Promise<NoteWithFiles | MyErrorObj> {
    const user = await getUser();
    const note = await db.select().from(notesTable).innerJoin(usersTable, eq(usersTable.id, notesTable.userId)).where(eq(notesTable.id, id)).limit(1);
    const fileRequest = getFilesForNote(id, note[0].users.username);
    if(!allowPublic && !user) return MyError.create({message: 'Not signed in', authRequired: true});
    if((allowPublic && !note[0].notes.public || !allowPublic) && (!user || note[0].notes.userId !== user.id)) return MyError.create({message: 'This isnt your note, what is wrong with you'});
    if(note.length !== 1) return MyError.create({message: 'Note not found'});

    const files = await fileRequest;
    if(MyError.isInstanceOf(files)) return files;

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
        Prefix: `${username}/${id}/`
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
        return MyError.create({message: 'Failed to read files'});
    }
}

async function checkTotalFileSize(username: string, newFileSize: number): Promise<number | MyErrorObj> {
    const user = await getUser();
    if(user && user.username === 'dylan') return 1;

    const client = new S3Client();
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Prefix: `${username}/`
    }
    const command = new ListObjectsCommand(params);
    try {
        const resp = await client.send(command);
        if(!resp.Contents) return 1;
        const totalFileSize = resp.Contents.reduce((prev, current) => {
            return prev + (current.Size || 0);
        }, 0);
        const totalFileSizeMB = totalFileSize/1024/1024;
        return Number((totalFileSizeMB + (newFileSize/1024/1024)) < TOTAL_MAX_FILE_SIZE);
    } catch {
        return MyError.create({message: 'Failed to check total file size'});
    }
}