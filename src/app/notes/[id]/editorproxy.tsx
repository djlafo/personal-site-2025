'use client'

import dynamic from 'next/dynamic';
import { Note } from '@/actions/notes';

interface EditorProps {
    note?: Note
}
const Editor = dynamic(() => import('./editor'), {ssr: false});
export default function Proxy({note}: EditorProps) {
    return <Editor note={note}/>
}