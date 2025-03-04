import { getTTS } from "@/actions/tts";
import { MyError } from "@/lib/myerror";
import { useState } from "react";

interface AudioLog {
    text: string;
    audio: string;
}

interface AudioLogProm {
    text: string;
    audio: Promise<string>;
}

export default function useAudioLoader() {
    const [audioLogs, setAudioLogs] = useState<AudioLog[]>([]);
    const [requests, setRequests] = useState<AudioLogProm[]>([]);

    const loadTTS = (text: string) => {
        const match = audioLogs.find(a => a.text === text) || requests.find(r => r.text === text);
        if(!match) {
            const newReq = new Promise<string>((acc, rej) => {
                getTTS(text).then(audio => {
                    setRequests(rs => rs.filter(r => r.text !== text));
                    if(audio instanceof MyError) {
                        rej(audio.message);
                    } else {
                        setAudioLogs(al => al.concat([{
                            audio: audio,
                            text: text
                        }]));
                        acc(audio);
                    }
                });
            });
            setRequests(r => r.concat([{
                text: text,
                audio: newReq
            }]));
            return newReq;
        } else {
            return match.audio;
        }
    }

    return loadTTS;
}
