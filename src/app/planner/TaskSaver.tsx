'use client'
import { useEffect, useState } from "react";

import { getPlannerData, savePlannerData } from "@/actions/planner";
import { getEmptyPlanner, PlannerData } from "./UsePlanner";
import { useUser } from "@/components/Session";
import { toast } from "react-toastify";
import { MyError } from "@/lib/myerror";


interface TaskSaverProps {
    onLoad: (pd?: PlannerData) => void;
    plannerData: PlannerData
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
        if(!loaded) toast('Nothing saved');
    };

    const saveToServer = () => {
        savePlannerData(props.plannerData).then(r => {
            if(r instanceof MyError) {
                toast(r.message);
            } else {
                setLastSaved(props.plannerData);
            }
        });
    }

    const loadServer = () => {
        getPlannerData().then(pd => {
            if(pd instanceof MyError) {
                toast(pd.message);
            } else {
                props.onLoad(pd);
                setLastSaved(pd);
            }
        });
    }

    const load = () => {
        if(typeof window === 'undefined') return;
        const storage = localStorage.getItem('tasks');
        if(!storage) return;
        try {
            const pd: PlannerData = JSON.parse(storage);
            if(pd.tasks.length) {
                props.onLoad(pd);
                setLastSaved(pd);
                return true;
            }
        } catch { 
            return false;
        }
    }

    const clearValues = () => {
        const copy: PlannerData = JSON.parse(JSON.stringify(props.plannerData));
        copy.tasks.forEach(t => {
            t.deadline = 0;
            t.motivation = 0;
        });
        props.onLoad(copy);
    }

    const isSaved = () => {
        return JSON.stringify(lastSaved)===JSON.stringify(props.plannerData);
    }

    useEffect(() => {
        if(!props.plannerData.tasks.length)
            load();
    }, []);

    return <>
        {
            (props.plannerData.tasks.length !== 0 && <>
                <span>
                    <label>Clear</label>
                    <input type='button' value='Rows' onClick={() => props.onLoad(getEmptyPlanner())}/>
                    <input type='button' value='Times&Values' onClick={() => clearValues()}/>
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
                (isSaved() ? 'Last change saved' : 'Last change unsaved')
            }
        </label>
    </>
}