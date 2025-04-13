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
    note: Note;
    notes: Note[];
}
export function NoteParent({note, notes}: NoteParentProps) {
    const children = notes.filter(n => n.parentId === note.id);
    const [opened, setOpened] = useState<boolean>(false);

    return <div className={`${styles.parentContainer} ${children.length ? styles.hasChildren : ''}`}>
        {children.length && <span onClick={() => setOpened(o => !o)}>{opened ? '-' : '+'}</span> || <>*</>}
        <NoteItem note={note}/>
            {
                children.length && 
                <div className={`${styles.noteParent} ${opened ? styles.opened : ''}`}>
                    {children.map(c => {
                        return <NoteParent key={c.id} notes={notes} note={c}/>;
                    })}
                </div> || <></>
            }
    </div>;
}