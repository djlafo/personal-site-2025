'use client'

import Link from "next/link";
import { addFile, createNote, deleteFile, deleteNote, MAX_FILE_SIZE, NoteWithFiles, updateNote } from "@/actions/notes";
import { useUser } from "@/components/Session";
import { useRouter, useSearchParams } from "next/navigation";
import Quill from "quill";
import hljs from 'highlight.js';
import ImageResize from 'quill-image-resize';
Quill.register('modules/imageResize', ImageResize);
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import styles from '../tts.module.css';
import OCR from "@/components/OCR";
import { MyError } from "@/lib/myerror";

export interface QuillEditorProps {
    onStart: (paragraphs: string[]) => void;
    note?: NoteWithFiles;
}
export default function QuillEditor({onStart, note: _note}: QuillEditorProps) {
    const searchParams = useSearchParams();
    const [user] = useUser();
    const router = useRouter();
    const [note, setNote] = useState(_note);
    const [content, setContent] = useState(note?.text || '[]');
    const [textContent, setTextContent] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const quillRef = useRef<HTMLDivElement>(null);

    const _createNote = async () => {
        const newNote = await createNote(content, searchParams.get('pId') || undefined);
        if(newNote instanceof MyError) {
            toast(newNote.message);
        } else {
            toast('Created');
            setNote(newNote);
        }
}

    const _updateNote = async (checked?: boolean) => {
        if(!note) return;
        const updatedNote = await updateNote(note.id, content, checked);
        if(updatedNote instanceof MyError) {
            toast(updatedNote.message);
        } else {
            toast('Updated');
            setNote(updatedNote);
        }
    }

    const _addFile = async () => {
        if(!note || !fileRef.current || !fileRef.current.files || fileRef.current.files.length !== 1) return;
        if(fileRef.current.files[0].size >= MAX_FILE_SIZE) {
            toast(`File too big (max ${MAX_FILE_SIZE}mb): ${(fileRef.current.files[0].size/1024/1024).toFixed(2)}mb`)
            return;
        }
        const data = new FormData();
        data.append('file', fileRef.current.files[0], fileRef.current.value);
        toast('Uploading file...');
        const resp = await addFile(note.id, data);
        if(resp instanceof MyError) {
            toast(resp.message)
        } else {
            toast('File Added');
            setNote(resp);
        }
    }

    const _deleteFile = async (filename: string) => {
        if(!note) return;
        const resp = await deleteFile(note.id, filename);

        if(resp instanceof MyError) {
            toast(resp.message);
        } else {
            toast(`Deleted ${filename}`);
            setNote(resp);
        }
    }

    const _deleteNote = async () => {
        if(!note) return;
        if(!confirm("Are you sure?")) return;
        localStorage.removeItem(`NOTE[${note.id}]`);
        if(await deleteNote(note.id)) {
            router.push('/notes');
        } else {
            toast('Failed to delete');
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
                syntax: { hljs },
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
                ],
                imageResize: {}
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
        // eslint-disable-next-line
    }, []);

    return <>
        <div className={styles.quill} ref={quillRef}/>

        <div className={styles.fileList}>
            {
                note && note.files.length === 0 && <span>No files attached</span>
            }
            {
                note && note.files.length > 0 && note.files.map(f => {
                    return <div key={f}>
                        <a href={`/notes/${note.id}/${f}`} 
                            rel="noopener noreferrer" 
                            target="_blank">
                            {f}
                        </a>
                        <button onClick={() => _deleteFile(f)}>Delete</button>
                    </div>;
                })
            }
        </div>

        <div className={styles.buttons}>
            <OCR onText={s => setTextContent(tc => tc + s)}
                className={styles.ocr}/>
            <input type='button' 
                value="Generate Audio" 
                onClick={() => onStart(textContent.split('\n\n').filter(p => !!p))}/>
            {user && (note && note.username === user.username && note.text != content || !note) &&
                <span className={styles.warningText}>Changes not saved!</span>
            }
            {user && !note &&
                <input type='button' 
                    value="Create Note" 
                    onClick={() => _createNote()}/> || <></>
            }
            {user && note && note.username === user.username && 
                <>
                    <input type='button' 
                        value='Update Note' 
                        onClick={() => _updateNote()}/>
                    <input type='button' 
                        value='Delete Note' 
                        onClick={() => _deleteNote()}/>
                    <div>
                        <label htmlFor='publicCheckbox'>Public</label>
                        <input id='publicCheckbox'
                            type='checkbox'
                            defaultChecked={note.public}
                            onChange={e => _updateNote(e.target.checked)}/>
                    </div>
                    <input type='file' ref={fileRef}/>
                    <button onClick={() => _addFile()}>Add File</button>
                    <Link href={`/notes/new?pId=${note.id}`}>New Subnote</Link>
                </> || <></>
            }
        </div>
    </>;
}