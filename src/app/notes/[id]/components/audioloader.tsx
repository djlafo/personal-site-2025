import { getTTS } from "@/actions/tts";
import { useState } from "react";
import { toast } from "react-toastify";

interface AudioLog {
    text: string;
    audio: string;
}
export default function useAudioLoader() {
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
