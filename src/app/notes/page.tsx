import { getNotes } from "@/actions/notes";
import { getUser } from "@/lib/sessions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { NoteList } from "./client";

import { MyError } from "@/lib/myerror";

export const metadata: Metadata = {
    title: "Notes"
};

export default async function Page() {
    const user = await getUser();

    if(user) {
        const notes = await getNotes();
        if(MyError.isInstanceOf(notes)) {
            return <div>
                {notes.message}
            </div>;
        } else {
            return <NoteList notes={notes}/>
        }
    } else {
        redirect('/notes/new');
    }
}