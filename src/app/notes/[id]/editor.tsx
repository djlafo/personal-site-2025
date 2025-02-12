"use client"

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Quill from 'quill';

import OCR from "@/components/OCR";
import { useUser } from "@/components/Session";
import { useLoadingScreen } from "@/components/LoadingScreen";

import { getTTS } from "@/actions/tts";
import { deleteNote, updateNote, createNote, Note } from "@/actions/notes";

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

    const [loading, setLoading] = useLoadingScreen();

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
        {
            !currentAudio ? 
            <TTSTextEditor
                note={note}
                onStart={pg => {
                    setParagraphs(pg);
                    setQueueRead(true);
                }}/>
            :
            <TTSTextDisplay paragraphs={paragraphs}
                onClickParagraph={getAudioAndLoad}
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
    onStart: (paragraphs: string[]) => void;
    note?: Note
}
function TTSTextEditor({onStart, note}: TTSTextEditorProps) {
    const [user] = useUser();
    const router = useRouter();
    const [content, setContent] = useState(note?.text || '[]');
    const [textContent, setTextContent] = useState('');
    const quillRef = useRef<HTMLDivElement>(null);

    const _createNote = async () => {
        try {
            const newNote = await createNote(content);
            toast('Created');
            router.replace(`/notes/${newNote.id}`);
        } catch(e) {
            if(e instanceof Error) toast(e.message);
        }
    }

    const _updateNote = async (checked?: boolean) => {
        if(!note) return;
        try {
            await updateNote(note.id, content, checked);
            toast('Updated');
        } catch(e) {
            if(e instanceof Error) toast(e.message);
        }
    }

    const _deleteNote = async () => {
        if(!note) return;
        try {
            await deleteNote(note.id);
            router.push('/notes');
        } catch(e) {
            if(e instanceof Error) toast(e.message);
        }
    }

    useEffect(() => {
        if(!quillRef.current) return;

        const container = quillRef.current;
        if(!(container instanceof HTMLDivElement)) return;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement('div')
        );
        const quill = new Quill(editorContainer, {
            modules: {
                toolbar: [
                    [{'size': ['small', false, 'large', 'huge']}], 
                    [{'header': [1,2,3,4,5,6,false]}],
                    ['bold', 'italic', 'underline', 'strike'], 
                    [{'color': []}, {'background': []}], 
                    [{'script': 'sub'}, {'script': 'super'}], 
                    ['blockquote', 'code-block'], 
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}, {'indent': '-1'}, {'indent': '+1'}], 
                    [{'direction': 'rtl'}, {'align': []}], 
                    ['link', 'image', 'video']
                ]
            },
            theme: 'snow'
        });

        try {
            quill.setContents(JSON.parse(content));
        } catch {
            quill.setText(content);
        }
        setTextContent(quill.getText());
        
        quill.on(Quill.events.TEXT_CHANGE, () => {
            setTextContent(quill.getText());
            setContent(JSON.stringify(quill.getContents()));
        });

        return () => {
            quillRef.current = null;
            container.innerHTML = '';
        }
    }, [quillRef]);

    return <>
        <div className={styles.quill} ref={quillRef}/>

        <div className={styles.buttons}>
            <OCR onText={s => setTextContent(tc => tc + s)}
                className={styles.ocr}/>
            <input type='button' 
                value="Generate Audio" 
                onClick={() => onStart(textContent.split('\n\n').filter(p => !!p))}/>
            {user && !note &&
                <input type='button' 
                    value="Create Note" 
                    onClick={() => _createNote()}/> || <></>
            }
            
            {user && note && note.yours && 
                <>
                    <input type='button' 
                        value="Update Note" 
                        onClick={() => _updateNote()}/>
                    <input type='button' 
                        value="Delete Note" 
                        onClick={() => _deleteNote()}/>
                    <div>
                        <label htmlFor='publicCheckbox'>Public</label>
                        <input id='publicCheckbox'
                            type='checkbox'
                            defaultChecked={note.public}
                            onChange={e => _updateNote(e.target.checked)}/>
                    </div>
                </> || <></>
            }
        </div>
    </>;
}

interface TTSTextDisplayProps {
    paragraphs: string[];
    onClickParagraph: (paragraph: string, ind?: number) => void;
    activeRow: number;
    onEditRequest: () => void;
}
function TTSTextDisplay({paragraphs, onClickParagraph, activeRow, onEditRequest}:TTSTextDisplayProps) {
    useEffect(() => {
        const detectMediaKeys = (e : KeyboardEvent) => {
            if(e.key === 'ArrowDown') {
                e.preventDefault();
                onClickParagraph(paragraphs[activeRow + 1], activeRow + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onClickParagraph(paragraphs[activeRow - 1], activeRow - 1);
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
                onDoubleClick={() => onClickParagraph(t, i)}>
                {t}
            </div>;
        })}
        <div className={styles.buttons}>
            <input type='button'
                value="Edit Text" 
                onClick={() => onEditRequest()}/>
        </div>
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