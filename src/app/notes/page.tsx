import { getNotes, Note } from "@/actions/notes";
import { getUser } from "@/lib/sessions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewNoteButton, NoteParent } from "./client";

import styles from './notes.module.css';

import { MyError } from "@/lib/myerror";

export const metadata: Metadata = {
    title: "Notes"
};

export default async function Page() {
    const user = await getUser();

    if(user) {
        const notes = await getNotes();

        if(notes instanceof MyError) {
            return <div>
                {notes.message}
            </div>;
        } else {
            return <div className={styles.notes}>
                <NewNoteButton/>
                <div>
                    <NoteParent notes={notes}/>
                </div>
            </div>;
        }
    } else {
        redirect('/notes/new');
    }
}