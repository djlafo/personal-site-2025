"use client"

import { useState } from "react";
import Link from "next/link";

import { useUser } from "@/components/Session";

import { NoteWithFiles } from "@/actions/notes";

import QuillEditor from "./components/QuillEditor";
import ReadDisplay from "./components/ReadDisplay";
import { AudioPlayerContainer } from "./components/AudioPlayer";

import styles from "./tts.module.css";  

interface EditorProps {
    note?: NoteWithFiles;
}
export default function Editor({note}: EditorProps) {
    const [user] = useUser();
    const [paragraphs, setParagraphs] = useState<string[]>([]);

    return <div className={styles.tts}>
        {user && <Link href='/notes'>Back</Link> || <></>}
        {note && <span> Owned by {note.username}</span>}

        <div className={`${styles.editorDiv} ${paragraphs && paragraphs.length ? styles.hidden : ''}`}>
            <QuillEditor
                note={note}
                onStart={pg => {
                    setParagraphs(pg);
                }}/>
        </div>
        {paragraphs && paragraphs.length && 
            <Reader paragraphs={paragraphs} 
                onEdit={() => setParagraphs([])}/> 
            || <></>}
    </div>;
}

interface ReaderProps {
    paragraphs: string[];
    onEdit: () => void;
}
function Reader({paragraphs, onEdit}: ReaderProps) {
    const [currentReading, setCurrentReading] = useState(0);
    
    const nextParagraph = () => {
        if(currentReading + 1 !== paragraphs.length) {
            setCurrentReading(currentReading + 1);
        }
    }

    return <>
        <ReadDisplay paragraphs={paragraphs}
            onClickParagraph={(t, i) => {
                setCurrentReading(i);
            }}
            activeRow={currentReading}
            onEditRequest={onEdit}/>
        <AudioPlayerContainer onEnd={nextParagraph}
            paragraphs={paragraphs}
            currentReading={currentReading}
            autoplay/>   
    </>;
}