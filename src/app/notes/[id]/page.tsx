import { getNote } from "@/actions/notes";
import EditorProxy from "./EditorProxy";
import { getNoteTitleFromDelta } from "../helpers";
import { MyError } from "@/lib/myerror";

export async function generateMetadata({ params }: PageProps) { // , parent: ResolvingMetadata
    const p = await params;
    if(p.id === 'new') {
        return {
            title: 'New Note',
            description: 'A note'
        }
    } else {
        const note = await getNote(p.id);
        if(MyError.isInstanceOf(note)) {
            return {
                title: 'Error'
            }
        } else {
            return {
                title: getNoteTitleFromDelta(note.text),
                description: 'A note'
            }
        }
    }
}

interface PageProps {
    params: Promise<{ id: string}>;
}
export default async function Page({params}: PageProps) {
    const p = await params;
    if(p.id === 'new') {
        return <EditorProxy/>;
    } else {
        const note = await getNote(p.id);
        if(MyError.isInstanceOf(note)) {
            return <span>{note.message}</span>;
        } else {
            return <EditorProxy note={note}/>;
        }
    }

}