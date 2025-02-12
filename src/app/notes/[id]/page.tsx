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
        try {
            const note = await getNote(p.id);
            return {
                title: `${note.text.substring(0,25)}...`,
                description: 'A note'
            }
        } catch {
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
        return <Editor/>;
    } else {
        try {
            const note = await getNote(p.id);
            return <Editor note={note}/>
        } catch(e) {
            if(e instanceof Error) return <span>{e.message}</span>;
        }
    }

}