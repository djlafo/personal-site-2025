"use client"

import { useEffect, useRef, useState } from "react";

import { getTTS } from "@/actions/tts";

import styles from "./tts.module.css"; 
import OCR from "@/components/OCR";
import { toast } from "react-toastify";
import { useLoadingScreen } from "@/components/LoadingScreen";

interface ReadingType {
    text: string;
    audio?: string;
}
export default function Page() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [textContent, setTextContent] = useState('');
    const [playing, setPlaying] = useState(false);
    const [splitText, setSplitText] = useState<Array<ReadingType>>();
    const [currentReading, setCurrentReading] = useState(0);

    const [loading, setLoading] = useLoadingScreen();

    const startTTS = async () => {
        if(!splitText) return;
        const audio = await loadTTS(splitText, 0);
        if(audio) playTTS(audio);

        setCurrentReading(0);
    }

    const playTTS = (audio: string) => {
        if(audioRef.current !== null) {
            setLoading(false);
            audioRef.current.src = "data:audio/mpeg;base64," + audio;
            audioRef.current.play();
        }
    }

    const loadTTS = async (arr: Array<ReadingType>, ind: number, preload=2) => {
        if(ind>=arr.length) return;
        let ret;
        if(!arr[ind].audio) {
            try {
                if(audioRef.current && audioRef.current.paused && preload === 2) setLoading(true);
                ret = await getTTS(arr[ind].text);
            } catch (e) {
                if(e instanceof Error) toast(e.message);
                return;
            }
            storeAudio(ret, ind);
        } else {
            ret = arr[ind].audio;
        }
        if(preload > 0) loadTTS(arr, ind+1, preload-1);
        return ret;
    }

    const storeAudio = (audio: string, ind: number) => {
        if(!splitText || splitText[ind].audio === audio) return;
        splitText[ind].audio = audio;
    };

    const nextParagraph = async () => {
        if(!playing || !splitText) return;
        if(currentReading+1 !== splitText.length) {
            const div = document.querySelector(`#readingRow${currentReading+1}`);
            if(div) div.scrollIntoView({
                behavior: 'smooth'
            });
            const audio = await loadTTS(splitText, currentReading+1);
            if(audio) playTTS(audio);
            
            setCurrentReading(currentReading+1);
        }
    }

    const playFrom = async (n: number) => {
        if(!playing || !splitText) return;
        if(n < 0 || n >= splitText.length) return;
        if(audioRef.current) audioRef.current.pause();
        
        const audio = await loadTTS(splitText, n);
        if(audio) playTTS(audio);
        
        setCurrentReading(n);
    }

    useEffect(() => {
        const detectMediaKeys = (e : KeyboardEvent) => {
            if(e.key === 'ArrowDown') {
                nextParagraph();
            } else if (e.key === 'ArrowUp') {
                playFrom(currentReading - 1);
            } else if (e.key === ' ' && audioRef.current) {
                audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
            }
        };

        window.addEventListener('keydown', detectMediaKeys);
        return () => {
            window.removeEventListener('keydown', detectMediaKeys);
        }
    }, [])

    return <div className={styles.tts}>
        {!playing ? 
            <textarea onChange={e => {
                    setTextContent(e.target.value);
                    setSplitText(e.target.value.split('\n').filter(s => !!s).map(s => {
                        return {
                            text: s
                        };
                    }));
                }}
                value={textContent}
                rows={10}/>
            :
            <div>
                {splitText && splitText.map((t,i) => {
                    return <div key={i} id={`readingRow${i}`}
                        className={`${styles.readingText} ${i===currentReading ? styles.currentReading : ''}`}
                        onDoubleClick={() => playFrom(i)}>
                        {t.text}
                    </div>;
                })}
            </div>
        }
        <div className={styles.buttons}>
            {playing && 

                <input type='button'
                    value="Edit Text" onClick={() => {
                    setPlaying(false);
                    if(audioRef.current) audioRef.current.pause();
                }}/>

                ||
                
                <>
                    <OCR onText={s => setTextContent(tc => tc + s)}
                        className={styles.ocr}/>
                    <input type='button' 
                        value="Generate Audio" onClick={() => startTTS()}/>
                </>}
        </div>

        <audio ref={audioRef} 
            controls
            onPlaying={() => setPlaying(true)}
            onEnded={() => nextParagraph()}/>
    </div>;
}