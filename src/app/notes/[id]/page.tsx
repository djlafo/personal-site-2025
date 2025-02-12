import { ResolvingMetadata } from "next";

import { getNote } from "@/actions/notes";
import EditorProxy from "./editorproxy";
import { getTextFromDelta } from "./helpers";

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata) {
    const p = await params;
    if(p.id === 'new') {
        return {
            title: 'New Note',
            description: 'A note'
        }
    } else {
        try {
            const note = await getNote(p.id);
            const text = getTextFromDelta(note.text);
            return {
                title: `${text.substring(0,25)}...`,
                description: 'A note'
            }
        } catch(e) {
            console.log(e);
            return {
                title: 'Error'
            }
        }
    }
}

interface PageProps {
    params : Promise<{ id: string}>
}
export default async function Page({params}: PageProps) {
    const p = await params;
    if(p.id === 'new') {
        return <EditorProxy/>;
    } else {
        try {
            const note = await getNote(p.id);
            return <EditorProxy note={note}/>;
        } catch(e) {
            if(e instanceof Error) return <span>{e.message}</span>;
        }
    }

}