'use client'

import dynamic from 'next/dynamic';
import { NoteWithFiles } from '@/actions/notes';

interface EditorProps {
    note?: NoteWithFiles;
}
const Editor = dynamic(() => import('./Editor'), {ssr: false});
export default function Proxy({note}: EditorProps) {
    return <Editor note={note}/>
}