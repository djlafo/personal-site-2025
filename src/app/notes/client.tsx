'use client'

import { getTextFromDelta } from "./[id]/helpers";

import styles from './notes.module.css';
import { Note } from "@/actions/notes";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NoteItemProps {
    note: Note;
}
export function NoteItem({note}: NoteItemProps) {

    return <span className={styles.noteItem}>
        <Link href={`/notes/${note.id}`}>
            {getTextFromDelta(note.text).split('\n')[0].substring(0, 100)}...
        </Link>
    </span>;
}

export function NewNoteButton() {
    return <Link href='/notes/new'>New</Link>
}

function orderNotesByChildren(subnotes: Note[], notes: Note[]): Note[] {
    const hasChildren: Note[] = [];
    const noChildren: Note[] = [];
    subnotes.forEach(c => {
        const child = notes.find(n => n.parentId === c.id);
        if(child) {
            hasChildren.push(c); 
        } else {
            noChildren.push(c);
        }
    });
    return [...hasChildren, ...noChildren];
}

interface NoteParentProps {
    note?: Note;
    notes: Note[];
}
export function NoteParent({note, notes}: NoteParentProps) {
    const [opened, setOpened] = useState<boolean>(!note);

    const _setOpened = (b: boolean) => {
        if(note) {
            if(!b) {
                localStorage.removeItem(`NOTE[${note.id}]`);
            } else {
                localStorage.setItem(`NOTE[${note.id}]`, 'yes');
            }
        }
        setOpened(b);
    }

    const children = orderNotesByChildren(notes.filter(n => note ? n.parentId === note.id : !n.parentId), notes);

    useEffect(() => {
        if(typeof window !== 'undefined' && note) {
            const ls = localStorage.getItem(`NOTE[${note.id}]`);
            setOpened(!!ls);
        }
        // eslint-disable-next-line
    }, []);

    return <div className={styles.parentContainer}>
        {note && <>
            {children.length && <span onClick={() => _setOpened(!opened)}>{opened ? '-' : '+'}</span> || <>&nbsp;</>}
            <NoteItem note={note}/>
        </>}
        {
            children.length && 
            <div className={`${styles.noteParent} ${!note ? styles.topLevel : ''} ${opened ? styles.opened : ''}`}>
                {children.map(c => {
                    return <NoteParent key={c.id} notes={notes} note={c}/>;
                })}
            </div> || <></>
        }
    </div>;
}