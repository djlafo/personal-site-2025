"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/components/Session";
import { useLoadingScreen } from "@/components/LoadingScreen";

import { Note } from "@/actions/notes";

import useAudioLoader from "./components/useAudioLoader";
import QuillEditor from "./components/QuillEditor";
import ReadDisplay from "./components/ReadDisplay";
import AudioPlayer from "./components/AudioPlayer";

import styles from "./tts.module.css";  

interface EditorProps {
    note?: Note
}
export default function Editor({note}: EditorProps) {
    const [user] = useUser();
    const router = useRouter();
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    const [currentReading, setCurrentReading] = useState(0);
    const {currentAudio, setAudioFor, loadTTS} = useAudioLoader();
    const [queueRead, setQueueRead] = useState(false);

    const [, setLoading] = useLoadingScreen();

    const getAudioAndLoad = async (text: string, i?: number) => {
        const ind = i || paragraphs.findIndex(p => p === text);
        if(ind === -1) return;
        setCurrentReading(ind);
        setLoading(true);
        setAudioFor();
        await setAudioFor(text);
        preload(ind, 2);
        setLoading(false);
    };

    const preload = async(start: number, times: number) => {
        for(let i=start+1; i<start+1+times; i++) {
            if(i < paragraphs.length) {
                loadTTS(paragraphs[i]);
            } else {
                break;
            }
        }
    }

    const nextParagraph = async () => {
        if(currentReading+1 !== paragraphs.length) {
            getAudioAndLoad(paragraphs[currentReading+1], currentReading+1);
        }
    }

    useEffect(() => {
        if(queueRead) {
            if(paragraphs && paragraphs.length) getAudioAndLoad(paragraphs[0]);
        }
    }, [paragraphs, queueRead]);

    return <div className={styles.tts}>
        {user && <input type='button' value='Back' onClick={() => router.push('/notes')}/> || <></>}

        <div className={`${styles.editorDiv} ${currentAudio ? styles.hidden : ''}`}>
            <QuillEditor
                note={note}
                onStart={pg => {
                    setParagraphs(pg);
                    setQueueRead(true);
                }}/>
        </div>
        {currentAudio &&
            <ReadDisplay paragraphs={paragraphs}
                onClickParagraph={getAudioAndLoad}
                activeRow={currentReading}
                onEditRequest={setAudioFor}/> || <></>
        }
        <AudioPlayer onEnd={nextParagraph}
            audio={currentAudio}
            autoplay/>
    </div>;
}




