'use client'

import Link from "next/link";
import { createNote, deleteNote, Note, updateNote } from "@/actions/notes";
import { useUser } from "@/components/Session";
import { useRouter, useSearchParams } from "next/navigation";
import Quill from "quill";
import ImageResize from 'quill-image-resize';
Quill.register('modules/imageResize', ImageResize);
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import styles from '../tts.module.css';
import OCR from "@/components/OCR";
import { MyError } from "@/lib/myerror";

export interface QuillEditorProps {
    onStart: (paragraphs: string[]) => void;
    note?: Note;
}
export default function QuillEditor({onStart, note}: QuillEditorProps) {
    const searchParams = useSearchParams();
    const [user] = useUser();
    const router = useRouter();
    const [content, setContent] = useState(note?.text || '[]');
    const [textContent, setTextContent] = useState('');
    const quillRef = useRef<HTMLDivElement>(null);

    const _createNote = async () => {
        const newNote = await createNote(content, searchParams.get('pId') || undefined);
        if(newNote instanceof MyError) {
            toast(newNote.message);
        } else {
            toast('Created');
            router.replace(`/notes/${newNote.id}`);
        }
}

    const _updateNote = async (checked?: boolean) => {
        if(!note) return;
        const updatedNote = await updateNote(note.id, content, checked);
        if(updatedNote instanceof MyError) {
            toast(updatedNote.message);
        } else {
            toast('Updated');
        }
    }

    const _deleteNote = async () => {
        if(!note) return;
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
                    <Link href={`/notes/new?pId=${note.id}`}>New Subnote</Link>
                </> || <></>
            }
        </div>
    </>;
}