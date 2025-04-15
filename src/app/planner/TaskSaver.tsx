'use client'
import { useEffect, useState } from "react";

import { getPlannerData, savePlannerData } from "@/actions/planner";
import { getEmptyPlanner, PlannerData } from "./usePlanner";
import { useUser } from "@/components/Session";
import { toast } from "react-toastify";
import { MyError } from "@/lib/myerror";


interface TaskSaverProps {
    onLoad: (pd?: PlannerData) => void;
    plannerData: PlannerData;
}

export default function TaskSaver({onLoad, plannerData}: TaskSaverProps) {
    const [lastSaved, setLastSaved] = useState(plannerData);
    const [user] = useUser();

    const checkClipboard = () => {
        if(!navigator.clipboard) {
            toast.error('Cant access the clipboard');
            return false;
        }
        return true;
    }
    const copy = () => {
        if(!checkClipboard()) return;
        navigator.clipboard.writeText(JSON.stringify(plannerData));
        toast.success('Copied to clipboard');
    };

    const paste = () => {
        if(!checkClipboard()) return;
        navigator.clipboard.readText().then(t => {
            try {
                const copied = JSON.parse(t);
                if(copied.constructor === Object) {
                    onLoad(copied);
                } else {
                    throw new Error('Invalid tasks format');
                }
            } catch {
                toast.warning('This doesn\'t seem to be the right data');
            }
        });
    };

    const saveToBrowser = () => {
        if(typeof window === 'undefined') return;
        localStorage.setItem('tasks', JSON.stringify(plannerData));
        setLastSaved(plannerData);
    };

    const loadBrowser = () => {
        const loaded = load();
        if(!loaded) toast.info('Nothing saved');
    };

    const saveToServer = () => {
        savePlannerData(plannerData).then(r => {
            if(MyError.isInstanceOf(r)) {
                toast.error(r.message);
            } else {
                setLastSaved(plannerData);
            }
        });
    }

    const loadServer = () => {
        getPlannerData().then(pd => {
            if(MyError.isInstanceOf(pd)) {
                toast.error(pd.message);
            } else {
                onLoad(pd);
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
                onLoad(pd);
                setLastSaved(pd);
                return true;
            }
        } catch { 
            return false;
        }
    }

    const clearValues = () => {
        const copy: PlannerData = JSON.parse(JSON.stringify(plannerData));
        copy.tasks.forEach(t => {
            t.deadline = 0;
            t.motivation = 0;
        });
        onLoad(copy);
    }

    const isSaved = () => {
        return JSON.stringify(lastSaved)===JSON.stringify(plannerData);
    }

    useEffect(() => {
        if(!plannerData.tasks.length)
            load();
        // eslint-disable-next-line
    }, []);

    return <>
        {
            (plannerData.tasks.length !== 0 && <>
                <span>
                    <label>Clear</label>
                    <input type='button' value='Rows' onClick={() => onLoad(getEmptyPlanner())}/>
                    <input type='button' value='Times&Values' onClick={() => clearValues()}/>
                </span>
            </>) || <></>
        }
        <span>
            {
                user && <>
                    <label>Server</label>
                    {
                        (plannerData.tasks.length !== 0 && <>
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
                (plannerData.tasks.length !== 0 && <>
                        <input type='button' value='Save' onClick={() => saveToBrowser()}/>
                </>) || <></>
            }
            <input type='button' value='Load' onClick={() => loadBrowser()}/>
        </span>
        <span>
            {   
                (plannerData.tasks.length !== 0 && <>
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