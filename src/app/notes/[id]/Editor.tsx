"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import { useUser } from "@/components/Session";
import { useLoadingScreen } from "@/components/LoadingScreen";

import { Note } from "@/actions/notes";

import useAudioLoader from "./components/useAudioLoader";
import QuillEditor from "./components/QuillEditor";
import ReadDisplay from "./components/ReadDisplay";
import AudioPlayer from "./components/AudioPlayer";

import styles from "./tts.module.css";  

interface EditorProps {
    note?: Note;
}
export default function Editor({note}: EditorProps) {
    const [user] = useUser();
    const router = useRouter();
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    const [currentReading, setCurrentReading] = useState(-1);
    const [currentAudio, setCurrentAudio] = useState<string | undefined>();
    const loadTTS = useAudioLoader();

    const [, setLoading] = useLoadingScreen();

    const getAudioAndLoad = async (text: string) => {
        const aud = loadTTS(text);
        if(aud instanceof Promise) {
            setLoading(true);
            try {
                const realAud = await aud;
                setCurrentAudio(realAud);
            } catch (e) {
                if(typeof e === 'string') toast(e); 
            } finally {
                setLoading(false);
            }
        } else {
            setCurrentAudio(aud);
        }
    };

    const preload = (start: number, times: number) => {
        for(let i=start+1; i<start+1+times; i++) {
            if(i < paragraphs.length) {
                loadTTS(paragraphs[i]);
            } else {
                break;
            }
        }
    }

    const nextParagraph = () => {
        if(currentReading + 1 !== paragraphs.length) {
            setCurrentReading(currentReading + 1);
        }
    }

    useEffect(() => {
        if(paragraphs && paragraphs.length && currentReading >= 0) {
            getAudioAndLoad(paragraphs[currentReading]);
            preload(currentReading, 2);
        }
    }, [paragraphs, currentReading]);

    return <div className={styles.tts}>
        {user && <input type='button' value='Back' onClick={() => router.push('/notes')}/> || <></>}

        <div className={`${styles.editorDiv} ${currentAudio ? styles.hidden : ''}`}>
            <QuillEditor
                note={note}
                onStart={pg => {
                    setParagraphs(pg);
                    setCurrentReading(0);
                }}/>
        </div>
        {currentAudio &&
            <ReadDisplay paragraphs={paragraphs}
                onClickParagraph={(t, i) => {
                    setCurrentReading(i);
                }}
                activeRow={currentReading}
                onEditRequest={() => {
                    setCurrentAudio(undefined);
                    setCurrentReading(-1);
                }}/> || <></>
        }
        <AudioPlayer onEnd={nextParagraph}
            audio={currentAudio}
            autoplay/>
    </div>;
}




