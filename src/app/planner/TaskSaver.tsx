'use client'
import { useState } from "react";

import { getPlannerData, savePlannerData } from "@/actions/planner";
import { getEmptyPlanner, PlannerData } from "./UsePlanner";
import { useUser } from "@/components/Session";
import { toast } from "react-toastify";


interface TaskSaverProps {
    onLoad: (pd?: PlannerData) => void;
    plannerData: PlannerData
}

export const load = () => {
    if(typeof window === 'undefined') return;
    const storage = localStorage.getItem('tasks');
    if(!storage) return;
    try {
        return JSON.parse(storage);
    } catch {}
}

export default function TaskSaver(props : TaskSaverProps) {
    const [lastSaved, setLastSaved] = useState(props.plannerData);
    const [user] = useUser();

    const checkClipboard = () => {
        if(!navigator.clipboard) {
            toast('Cant access the clipboard');
            return false;
        }
        return true;
    }
    const copy = () => {
        if(!checkClipboard()) return;
        navigator.clipboard.writeText(JSON.stringify(props.plannerData));
        toast('Copied to clipboard');
    };

    const paste = () => {
        if(!checkClipboard()) return;
        navigator.clipboard.readText().then(t => {
            try {
                const copied = JSON.parse(t);
                if(copied.constructor === Object) {
                    props.onLoad(copied);
                } else {
                    throw new Error('Invalid tasks format');
                }
            } catch (e) {
                toast('This doesn\'t seem to be the right data');
            }
        });
    };

    const saveToBrowser = () => {
        if(typeof window === 'undefined') return;
        localStorage.setItem('tasks', JSON.stringify(props.plannerData));
        setLastSaved(props.plannerData);
    };

    const loadBrowser = () => {
        const loaded = load();
        if(loaded) {
            props.onLoad(loaded);
        } else {
            toast('Nothing saved');
        }
    };

    const saveToServer = () => {
        savePlannerData(props.plannerData).then(r => {
            if(r) setLastSaved(props.plannerData);
        });
    }

    const loadServer = () => {
        getPlannerData().then(pd => {
            if(pd) {
                props.onLoad(pd);
            } else {
                toast('Nothing saved');
            }
        });
    }

    return <>
        {
            (props.plannerData.tasks.length !== 0 && <>
                <span>
                    <input type='button' value='Clear' onClick={() => props.onLoad(getEmptyPlanner())}/>
                </span>
            </>) || <></>
        }
        <span>
            {
                user && <>
                    <label>Server</label>
                    {
                        (props.plannerData.tasks.length !== 0 && <>
                                <input type='button' value='Save' onClick={() => saveToServer()}/>
                        </>) || <></>
                    }
                    <input type='button' value='Load' onClick={() => loadServer()}/>
                </> || <></>
            }
        </span>
        <span>
            <label>Browser</label>
            {
                (props.plannerData.tasks.length !== 0 && <>
                        <input type='button' value='Save' onClick={() => saveToBrowser()}/>
                </>) || <></>
            }
            <input type='button' value='Load' onClick={() => loadBrowser()}/>
        </span>
        <span>
            {   
                (props.plannerData.tasks.length !== 0 && <>
                    <input type='button' value='Copy' onClick={() => copy()}/>
                </>) || <></>
            }
            <input type='button' value='Paste' onClick={() => paste()}/>
        </span>
        <label>
            {
                (props.plannerData.tasks.length && (JSON.stringify(lastSaved)===JSON.stringify(props.plannerData) ? 'Last change saved' : 'Last change unsaved')) || ''
            }
        </label>
    </>
}