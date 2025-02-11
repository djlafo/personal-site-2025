'use client'

import { notesTable } from "@/db/schema/notes"
import { useRouter } from "next/navigation";

import styles from './notes.module.css';

interface NoteCardProps {
    note: typeof notesTable.$inferSelect
}
export function NoteCard({note}: NoteCardProps) {
    const router = useRouter();

    return <div className={styles.noteCard} 
        onClick={() => router.push(`tts/${note.id}`)}>
        {note.text.split('\n')[0].substring(0, 100)}...
    </div>;
}

export function NewNoteButton() {
    const router = useRouter();

    return <input type='button' 
        onClick={() => router.push('tts/new')}
        value='Create'/>;
}