import { getNote } from "@/actions/notes";
import Editor from "./editor";
import { ResolvingMetadata } from "next";

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata) {
    const p = await params;
    if(p.id === 'new') {
        return {
            title: 'New Note',
            description: 'A note'
        }
    } else {
        const note = await getNote(Number(p.id));
        return {
            title: `${note.text.substring(0,25)}...`,
            description: 'A note'
        }
    }
}

interface PageProps {
    params : Promise<{ id: string}>
}
export default async function Page({params}: PageProps) {
    const p = await params;
    if(p.id === 'new') {
        return <Editor/>;
    } else {
        const note = await getNote(Number(p.id));
        return <Editor note={note}/>
    }

}