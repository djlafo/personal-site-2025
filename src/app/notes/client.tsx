'use client'

import { notesTable } from "@/db/schema/notes"
import { useRouter } from "next/navigation";

import styles from './notes.module.css';
import { Note } from "@/actions/notes";

interface NoteCardProps {
    note: Note
}
export function NoteCard({note}: NoteCardProps) {
    const router = useRouter();

    return <div className={styles.noteCard} 
        onClick={() => router.push(`/notes/${note.id}`)}>
        {note.text.split('\n')[0].substring(0, 100)}...
    </div>;
}

export function NewNoteButton() {
    const router = useRouter();

    return <input type='button' 
        onClick={() => router.push('/notes/new')}
        value='Create'/>;
}