'use client'

import { getTextFromDelta } from './helpers';

import styles from './notes.module.css';
import { moveNotes, Note } from "@/actions/notes";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { getNoteTitle } from "./helpers";
import { MyError } from '@/lib/myerror';
import { toast } from 'react-toastify';

type ListContextType = [
    boolean, // selecting
    (uuid: string, b: boolean) => void, // set uuid select status
    Note[] // selected notes
]
const ListContext = createContext<ListContextType>([
    false, 
    (uuid, b) => {
        throw new Error(`List context not initialized ${uuid} ${b}`);
    },
    []
]);

const formatNotes = (notes: Note[]) => {
    const newNotes = notes.map(n => {
        return {
            ...n,
            text: getTextFromDelta(n.text)
        }
    });
    return newNotes.sort((a,b) => a.text.localeCompare(b.text));
}

interface NoteListProps {
    notes: Note[];
}
export function NoteList({notes}: NoteListProps) {
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState<Note[]>([]);
    const [_notes, setNotes] = useState(formatNotes(notes));


    const notesUpdated = (newNotes: Note[]) => {
        setSelecting(false);
        setSelected([]);
        setNotes(formatNotes(newNotes));
    }

    const contextValue: ListContextType = [
        selecting,
        (uuid, b) => {
            if(b) {
                const note = _notes.find(n => n.id === uuid);
                if(note) {
                    setSelected(s => s.concat([note]));
                } else {
                    throw new Error(`Could not find note with id ${uuid}`);
                }
            } else {
                setSelected(s => s.filter(s => s.id !== uuid));
            }
        },
        selected
    ];

    return <div className={styles.notes}>
        <ListButtons 
            onNotesUpdated={notesUpdated}
            notes={_notes}
            onSelect={b => {
                setSelecting(b);
                setSelected([]);
            }}
            selected={selected}
            selecting={selecting}/>
        <div>
            <ListContext.Provider value={contextValue}>
                <NoteParent 
                    notes={_notes}/>
            </ListContext.Provider>
        </div>
    </div>;
}

interface NoteItemProps {
    note: Note;
}
export function NoteItem({note}: NoteItemProps) {
    const text = getNoteTitle(note.text);

    return <span className={styles.noteText}>
        <Link className='button-style' href={`/notes/${note.id}`}>
            {text}
        </Link>
    </span>;
}

interface ListButtonProps {
    onSelect: (selecting: boolean) => void;
    onNotesUpdated: (notes: Note[]) => void;
    selecting: boolean;
    notes: Note[];
    selected: Note[];
}
export function ListButtons({onSelect, selecting, notes, selected, onNotesUpdated}: ListButtonProps) {
    const [newParent, setNewParent] = useState('');

    const _onSelect = () => {
        onSelect(!selecting);
    }
    const _moveNotes = async () => {
        const newNotes = await moveNotes(selected.map(n => n.id), newParent);
        setNewParent('');
        if(MyError.isInstanceOf(newNotes)) {
            toast.error(newNotes.message);
        } else {
            onNotesUpdated(newNotes);
            toast.success('Notes Updated');
        }
    }

    return <>
        <Link className='button-style' href='/notes/new'>New</Link>
        <button onClick={_onSelect}>{selecting ? 'Cancel' : 'Select'}</button>
        {
            selecting && <>
                <select value={newParent}
                    onChange={e => setNewParent(e.target.value)}>
                    <option value="">None</option>
                    {notes.filter(n => !selected.find(s => s.id === n.id)).map(n => {
                        return <option key={n.id}
                            value={n.id}>
                            {getNoteTitle(n.text, 25)}
                        </option>
                    })}
                </select>
                <button onClick={() => _moveNotes()}>Move</button>
            </> || <></>
        }
    </>;
}

function orderNotesByChildren(subnotes: Note[], notes: Note[]): Note[] {
    const hasChildren: Note[] = [];
    const noChildren: Note[] = [];
    subnotes.forEach(c => {
        const child = notes.find(n => n.parentId === c.id);
        if(child) {
            hasChildren.push(c); 
        } else {
            noChildren.push(c);
        }
    });
    return [...hasChildren, ...noChildren];
}

interface NoteParentProps {
    note?: Note;
    notes: Note[];
}
export function NoteParent({note, notes}: NoteParentProps) {
    const [opened, setOpened] = useState<boolean>(!note);
    const [selecting, setSelected, selected] = useContext(ListContext);

    const _setOpened = (b: boolean) => {
        if(note) {
            if(!b) {
                localStorage.removeItem(`NOTE[${note.id}]`);
            } else {
                localStorage.setItem(`NOTE[${note.id}]`, 'yes');
            }
        }
        setOpened(b);
    }

    const children = orderNotesByChildren(notes.filter(n => note ? n.parentId === note.id : !n.parentId), notes);

    useEffect(() => {
        if(typeof window !== 'undefined' && note) {
            const ls = localStorage.getItem(`NOTE[${note.id}]`);
            setOpened(!!ls);
        }
        // eslint-disable-next-line
    }, []);

    return <div className={styles.parentContainer}>
        <div className={styles.noteItem}>
            {note && <>
                {children.length && 
                    <span onClick={() => _setOpened(!opened)}
                        className={styles.listButton}>
                        {opened ? '-' : '+'}
                    </span> 
                    || <>&nbsp;</>
                }
                {selecting && 
                    <input type='checkbox' 
                        checked={!!selected.find(s => s.id === note.id)} 
                        onChange={e => setSelected(note.id, e.target.checked)}/>
                }
                <NoteItem note={note}/>
            </>}
        </div>
        {
            children.length && 
            <div className={`${styles.noteParent} ${!note ? styles.topLevel : ''} ${opened ? styles.opened : ''}`}>
                {children.map(c => {
                    return <NoteParent
                        key={c.id} 
                        notes={notes} 
                        note={c}/>;
                })}
            </div> || <></>
        }
    </div>;
}