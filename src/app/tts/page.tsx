"use client"

import { useEffect, useRef, useState } from "react";

import { getTTS } from "@/actions/tts";

import styles from "./tts.module.css"; 
import OCR from "@/components/OCR";
import { toast } from "react-toastify";
import { useLoadingScreen } from "@/components/LoadingScreen";


export default function Page() {
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    const [currentReading, setCurrentReading] = useState(0);
    const {currentAudio, setAudioFor, loadTTS} = useAudioLoader();

    const [loading, setLoading] = useLoadingScreen();

    const getAudioAndLoad = async (text: string) => {
        const ind = paragraphs.findIndex(p => p === text);
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
            getAudioAndLoad(paragraphs[currentReading+1]);
        }
    }

    useEffect(() => {
        if(paragraphs && paragraphs.length) getAudioAndLoad(paragraphs[0]);
    }, [paragraphs]);

    return <div className={styles.tts}>
        {
            !currentAudio ? 
            <TTSTextEditor paragraphs={paragraphs}
                onStart={pg => setParagraphs(pg)}/>
            :
            <TTSTextDisplay paragraphs={paragraphs}
                onClickParagraph={pg => getAudioAndLoad(pg)}
                activeRow={currentReading}
                onEditRequest={setAudioFor}/>
        }
        <BottomAudioPlayer onEnd={nextParagraph}
            audio={currentAudio}
            autoplay/>
    </div>;
}

interface AudioLog {
    text: string;
    audio: string;
}
function useAudioLoader() {
    const [audioLogs, setAudioLogs] = useState<AudioLog[]>([]);
    const [currentAudio, setCurrentAudio] = useState<string | undefined>();

    const setAudioFor = async (text?: string) => {
        if(!text) {
            setCurrentAudio(undefined);
            return;
        }
        const audio = await loadTTS(text);
        if(audio) {
            setCurrentAudio(audio);
            return audio;
        } else {
            toast('Failed to load TTS audio');
        }
    }

    const loadTTS = async (text: string) => {
        const match = audioLogs.find(al => al.text === text);
        if(!match) {
            try {
                const audio = await getTTS(text);
                setAudioLogs(al => al.concat([{
                    text: text,
                    audio: audio
                }]));
                return audio;
            } catch (e) {
                if(e instanceof Error) toast(e.message);
                return;
            }
        } else {
            return match.audio;
        }
    }

    return {
        setAudioFor,
        currentAudio,
        loadTTS
    };
}


interface TTSTextEditorProps {
    paragraphs: string[];
    onStart: (paragraphs: string[]) => void;
}
function TTSTextEditor({onStart, paragraphs}: TTSTextEditorProps) {
    const [textContent, setTextContent] = useState(paragraphs.join('\n\n'));
    return <>
        <textarea onChange={e => setTextContent(e.target.value)}
            value={textContent}
            rows={10}/>

        <div className={styles.buttons}>
            <OCR onText={s => setTextContent(tc => tc + s)}
                className={styles.ocr}/>
            <input type='button' 
                value="Generate Audio" 
                onClick={() => onStart(textContent.split('\n\n').filter(p => !!p))}/>
        </div>
    </>;
}

interface TTSTextDisplayProps {
    paragraphs: string[];
    onClickParagraph: (paragraph: string) => void;
    activeRow: number;
    onEditRequest: () => void;
}
function TTSTextDisplay({paragraphs, onClickParagraph, activeRow, onEditRequest}:TTSTextDisplayProps) {
    useEffect(() => {
        const detectMediaKeys = (e : KeyboardEvent) => {
            if(e.key === 'ArrowDown') {
                onClickParagraph(paragraphs[activeRow + 1]);
            } else if (e.key === 'ArrowUp') {
                onClickParagraph(paragraphs[activeRow - 1]);
            }
        };

        window.addEventListener('keydown', detectMediaKeys);
        return () => {
            window.removeEventListener('keydown', detectMediaKeys);
        }
    }, [activeRow, onClickParagraph, paragraphs])

    useEffect(() => {
        if(!activeRow && activeRow !== 0) return;
        const div = document.querySelector(`#readingRow${activeRow}`);
        if(div) div.scrollIntoView({
            behavior: 'smooth'
        });
    }, [activeRow])

    return <div>
        {paragraphs.map((t,i) => {
            return <div key={i} id={`readingRow${i}`}
                className={`${styles.readingText} ${i===activeRow ? styles.currentReading : ''}`}
                onDoubleClick={() => onClickParagraph(t)}>
                {t}
            </div>;
        })}
        <input type='button'
            value="Edit Text" 
            onClick={() => onEditRequest()}/>
    </div>;
}

interface BottomAudioPlayerProps {
    onPlayChange?: (playing: boolean) => void;
    onEnd: () => void;
    audio?: string;
    autoplay?: boolean;
}
function BottomAudioPlayer({onPlayChange, onEnd, audio, autoplay}: BottomAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const detectMediaKeys = (e : KeyboardEvent) => {
            if (e.key === ' ' && audioRef.current) {
                audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
            }
        };
        window.addEventListener('keydown', detectMediaKeys);
        return () => {
            window.removeEventListener('keydown', detectMediaKeys);
        }
    }, [audioRef])

    useEffect(() => {
        if(!audioRef.current) return;
        if(autoplay && audio)  {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [audio]);

    return <audio ref={audioRef} 
        controls
        src={audio && `data:audio/mpeg;base64,${audio}` || undefined}
        onPlaying={() => onPlayChange && onPlayChange(true)}
        onEnded={() => onEnd()}/>
}