import { useEffect, useRef } from "react";

interface AudioPlayerProps {
    onPlayChange?: (playing: boolean) => void;
    onEnd: () => void;
    audio?: string;
    autoplay?: boolean;
}
export default function AudioPlayer({onPlayChange, onEnd, audio, autoplay}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const detectMediaKeys = (e: KeyboardEvent) => {
            if(!audioRef.current || !audio) return;
            if (e.key === ' ') {
                e.preventDefault();
                audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
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
    }, [audioRef, audio])

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