"use client"

import { useRef, useState } from "react";

import { getTTS } from "@/actions/tts";
import { toast, ToastContainer } from "react-toastify";

import styles from "./tts.module.css"; 

interface ReadingType {
    text: string;
    audio?: string;
}
export default function Page() {
    const [textContent, setTextContent] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [splitText, setSplitText] = useState<Array<ReadingType>>();
    const [currentReading, setCurrentReading] = useState(0);

    const startTTS = async () => {
        if(!textContent) return;
        const split = textContent.split('\n').filter(s => !!s).map(s => {
            return {
                text: s
            };
        });
        setSplitText(split);
        setCurrentReading(0);

        playTTS(split, 0);
    }

    const playTTS = async (arr: Array<ReadingType>, ind: number) => {
        const audio = await loadTTS(arr, ind);
        if(!audio) return;
        if(audioRef.current !== null) {
            audioRef.current.src = "data:audio/mpeg;base64," + audio;
            audioRef.current.play();
        }
        if(ind + 1 !== arr.length && !arr[ind+1].audio) {
            loadTTS(arr, ind+1);
        }
    }

    const loadTTS = async (arr: Array<ReadingType>, ind: number) => {
        if(!arr[ind].audio) {
            const res = await getTTS(arr[ind].text);
            if(typeof res !== 'string') {
                if(res.stderr) {
                    toast(res.stderr);
                }
                return;
            } else {
                setSplitText(st => {
                    return st?.map((s,i) => {
                        if(i===ind) {
                            return {
                                text: s.text,
                                audio: res
                            }
                        } else {
                            return s;
                        }
                    });
                });
                return res;
            }
        } else {
            return arr[ind].audio;
        }
    }

    const nextParagraph = () => {
        if(!playing || !splitText) return;
        if(currentReading+1 !== splitText.length) {
            setCurrentReading(currentReading+1);
            playTTS(splitText, currentReading+1);
        }
    }

    const playFrom = (n: number) => {
        if(!playing || !splitText) return;
        if(audioRef.current) audioRef.current.pause();
        setCurrentReading(n);
        playTTS(splitText, n);
    }

    return <div className={styles.tts}>
        <ToastContainer/>
        {!playing ? 
            <textarea value={textContent} 
                onChange={e => setTextContent(e.target.value)}
                rows={10}/>
            :
            <div>
                {splitText && splitText.map((t,i) => {
                    return <div key={i}
                        className={`${styles.readingText} ${i===currentReading ? styles.currentReading : ''}`}
                        onClick={() => playFrom(i)}>
                        {t.text}
                    </div>;
                })}
            </div>
        }
        <audio ref={audioRef} 
            controls
            onPlaying={() => setPlaying(true)}
            onEnded={() => nextParagraph()}/>
        {playing && 

            <input type='button' 
                value="Edit Text" onClick={() => {
                setPlaying(false);
                if(audioRef.current) audioRef.current.pause();
            }}/>

            ||

            <input type='button' 
                value="Generate Audio" onClick={() => startTTS()}/>}
    </div>;
}