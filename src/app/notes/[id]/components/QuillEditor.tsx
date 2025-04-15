'use client'

import Link from "next/link";
import { addFile, addFilePart, cancelFilePart, createNote, deleteFile, deleteNote, getNote, NoteWithFiles, updateNote } from "@/actions/notes";
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
import { MAX_FILE_SIZE } from "../../constants";

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
        if(MyError.isInstanceOf(newNote)) {
            toast.error(newNote.message);
        } else {
            toast.success('Created');
            setNote(newNote);
        }
}

    const _updateNote = async (checked?: boolean) => {
        if(!note) return;
        const updatedNote = await updateNote(note.id, content, checked);
        if(MyError.isInstanceOf(updatedNote)) {
            toast.error(updatedNote.message);
        } else {
            toast.success('Updated');
            setNote(updatedNote);
        }
    }

    const _addFile = async () => {
        if(!note || !fileRef.current || !fileRef.current.files || fileRef.current.files.length !== 1) return;
        if(user && user.username !== 'dylan' && fileRef.current.files[0].size >= MAX_FILE_SIZE) {
            toast.warning(`File too big (max ${MAX_FILE_SIZE}mb): ${(fileRef.current.files[0].size/1024/1024).toFixed(2)}mb`);
            return;
        }
        const file = fileRef.current.files[0];

        // create multipart
        const uploadId = await addFile(note.id, file.name, file.type, file.size);
        if(MyError.isInstanceOf(uploadId)) {
            toast.error(uploadId.message);
            return;
        }

        const lastToast = toast.loading('Uploading file...', {
            closeOnClick: true,
            onClose(removedByUser) {
                if(removedByUser) {
                    cancelFilePart(uploadId, file.name, note.id).then(res => {
                        if(MyError.isInstanceOf(res)) {
                            toast.error('Failed to cancel upload');
                        } else {
                            toast.success('Upload cancelled');
                        }
                    });
                }
            }
        });

        const data = await file.bytes();
        let start = 0;
        const tags = [];
        const chunkSize = 1024*1024*5; // 5mb
        do {
            const toastText = `${(start/file.size*100).toFixed(2)}% (Click to Cancel)`;
            toast.update(lastToast, {
                render: toastText
            });
            const endByte = (start+chunkSize > file.size) ? file.size : start+chunkSize;
            const part = await addFilePart(uploadId, data.slice(start,endByte), tags);
            if(MyError.isInstanceOf(part)) {
                toast.update(lastToast, {render: part.message, type: 'error'});
                return;
            } else if (part==='done') {
                break;
            } else {
                tags.push(part);
            }
            start = endByte;
        } while (start < data.length);
        toast.dismiss(lastToast);
        toast.success('File added');
        
        const reloadedNote = await getNote(note.id);
        if(MyError.isInstanceOf(reloadedNote)) {
            toast.error(reloadedNote.message);
        } else {
            setNote(reloadedNote);
        }
    }

    const _deleteFile = async (filename: string) => {
        if(!note) return;
        const resp = await deleteFile(note.id, filename);

        if(MyError.isInstanceOf(resp)) {
            toast.error(resp.message);
        } else {
            toast.success(`Deleted ${filename}`);
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
            toast.error('Failed to delete');
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