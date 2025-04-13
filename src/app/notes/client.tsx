'use client'

import { getTextFromDelta } from "./[id]/helpers";
import { useRouter } from "next/navigation";

import styles from './notes.module.css';
import { Note } from "@/actions/notes";
import { useState } from "react";

interface NoteItemProps {
    note: Note;
}
export function NoteItem({note}: NoteItemProps) {
    const router = useRouter();

    return <span className={styles.noteItem}>
        <span onClick={() => router.push(`/notes/${note.id}`)}>
            {getTextFromDelta(note.text).split('\n')[0].substring(0, 100)}...
        </span>
    </span>;
}

export function NewNoteButton() {
    const router = useRouter();

    return <input type='button' 
        onClick={() => router.push(`/notes/new`)}
        value={'New'}/>;
}

interface NoteParentProps {
    note?: Note;
    notes: Note[];
}
export function NoteParent({note, notes}: NoteParentProps) {
    const [opened, setOpened] = useState<boolean>(!note);

    const children = notes.filter(n => note ? n.parentId === note.id : !n.parentId);
    const hasChildren: Note[] = [];
    const noChildren: Note[] = [];
    children.forEach(c => {
        const child = notes.find(n => n.parentId === c.id);
        child ? hasChildren.push(c) : noChildren.push(c);
    });
    const sorted = [...hasChildren, ...noChildren];

    return <div className={styles.parentContainer}>
        {note && <>
            {children.length && <span onClick={() => setOpened(o => !o)}>{opened ? '-' : '+'}</span> || <>&nbsp;</>}
            <NoteItem note={note}/>
        </>}
        {
            children.length && 
            <div className={`${styles.noteParent} ${!note ? styles.topLevel : ''} ${opened ? styles.opened : ''}`}>
                {sorted.map(c => {
                    return <NoteParent key={c.id} notes={notes} note={c}/>;
                })}
            </div> || <></>
        }
    </div>;
}