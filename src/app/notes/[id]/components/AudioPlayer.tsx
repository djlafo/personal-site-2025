import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { useLoadingScreen } from "@/components/LoadingScreen";

import useAudioLoader from "./useAudioLoader";

interface AudioPlayerProps {
    onPlayChange?: (playing: boolean) => void;
    onEnd: () => void;
    audio: string;
    autoplay?: boolean;
}
export function AudioPlayer({onPlayChange, onEnd, audio, autoplay}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const detectMediaKeys = (e: KeyboardEvent) => {
            if(!audioRef.current) return;
            if (e.key === ' ') {
                e.preventDefault();
                if(audioRef.current.paused) {
                    audioRef.current.play()
                } else {
                    audioRef.current.pause();
                } 
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 4, 0);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 2, audioRef.current.duration)
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
        }
    }, [autoplay, audioRef, audio]);

    return <audio ref={audioRef} 
        controls
        src={audio && `data:audio/mpeg;base64,${audio}` || undefined}
        onPlaying={() => onPlayChange && onPlayChange(true)}
        onEnded={() => onEnd()}/>
}

interface AudioPlayerContainerProps extends Omit<AudioPlayerProps, 'audio'> {
    paragraphs: string[];
    currentReading: number;
}
export function AudioPlayerContainer({paragraphs, currentReading, ...theRest}: AudioPlayerContainerProps) {
    const [audio, setAudio] = useState<string>();
    
    const loadTTS = useAudioLoader();
    const [, setLoading] = useLoadingScreen();

    const getAudioAndLoad = async (text: string) => {
        const aud = loadTTS(text);
        if(aud instanceof Promise) {
            setLoading(true);
            try {
                const realAud = await aud;
                setAudio(realAud);
            } catch (e) {
                if(typeof e === 'string') toast(e); 
            } finally {
                setLoading(false);
            }
        } else {
            setAudio(aud);
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

    useEffect(() => {
        if(currentReading < 0 || currentReading >= paragraphs.length) return;
        getAudioAndLoad(paragraphs[currentReading]);
        preload(currentReading, 2);
        // eslint-disable-next-line
    }, [paragraphs, currentReading]);

    if(audio)
        return <AudioPlayer audio={audio} {...theRest} />;
}