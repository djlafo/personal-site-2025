'use client'

import { useEffect } from "react";
import { PlannerData, PlannerRow } from "./usePlanner";

import TimeInput from '@/components/TimeInput';

import styles from './planner.module.css';
import { useUser } from "@/components/Session";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";
import { checkAllPlannerRows, createUpdatePlannerRow, deletePlannerRow } from "@/actions/planner";

const TEXTAREA_PADDING = 5;

const onTimerOver = (done: boolean) => {
    if(done) return;
    const a = new Audio('/timer-alert.mp3');
    a.play();
    alert('Deadline reached!');
}

interface TaskListProps {
    plannerData: PlannerData;
    onSetPlannerData: (pd: PlannerData) => void;
    children: React.ReactNode;
}
export default function TaskList({plannerData, onSetPlannerData, children}: TaskListProps) {
    const [user] = useUser();
    const tasks = plannerData.tasks;

    const addRow = async () => {
        const res = await createUpdatePlannerRow({
            label: '',
            motivation: 0,
            done: false,
            deadline: null,
            text: false
        });
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onSetPlannerData(res);
            toast.success('Added');
        }
    }

    const updateRow = async (ind: number, pt: Partial<PlannerRow>) => {
        let tcc = JSON.parse(JSON.stringify(tasks[ind]));
        const diff = Object.entries(pt).some(([k, v]) => {
            return v !== tcc[k];
        });
        if(!diff) return;
        tcc = Object.assign(tcc, pt);
        const res = await createUpdatePlannerRow(tcc);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onSetPlannerData(res);
            toast.success('Updated');
        }
    }

    const removeRow = async(pr: PlannerRow) => {
        if(!pr.id) toast.error('This somehow doesn\'t have an ID');
        const res = await deletePlannerRow(pr.id);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onSetPlannerData(res);
            toast.success('Deleted');
        }
    }

    const anyChecked = () => {
        return tasks.some(t => t.done);
    }

    const checkAll = async (checked: boolean) => {
        const res = await checkAllPlannerRows(checked);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onSetPlannerData(res);
            toast.success(checked ? 'Checked' : 'Unchecked');
        }
    }

    // hack to resize on initial load, i apologize for this
    useEffect(() => {
        setTimeout(() => {
            const resize = () => document.querySelectorAll("textarea").forEach(textarea => {
                textarea.style.height = 'auto'
                textarea.style.height = textarea.scrollHeight + TEXTAREA_PADDING + "px";
            });
            window.onresize = resize;
            resize();
        }, 50);
    }, [tasks]);

    return <div className={styles.tasklist}>
        <div className={styles.buttons}>
            {(tasks.length && <>
                <span>
                    <input id='allCheck' 
                        type='checkbox'
                        checked={anyChecked()}
                        onChange={e => checkAll(e.target.checked)}/>
                    <label htmlFor='allCheck'>All</label>
                </span>
            </>) || <></>}
            {children}
        </div>
        {(tasks.length && 
            <div>
                {tasks.map((t, i)=> {

                    const overdue = t.deadline ? new Date(t.deadline).getTime() - Date.now() < 0 : false;
                    const timeLeft = t.deadline && !overdue ? Math.floor((new Date(t.deadline).getTime() - Date.now())/1000) : 0;

                    return <div key={t.id} 
                        className={`${styles.taskcell} ${t.done ? styles.done : ''} ${overdue ? styles.overdue : ''} ${t.deadline && !overdue ? styles.timed : ''}`}>        
                        <textarea rows={1}
                            defaultValue={t.label}
                            onBlur={e => {
                                updateRow(i, {label: e.target.value});
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight + TEXTAREA_PADDING}px`;
                            }}/>
                        <div className={styles.taskdetails}>
                            <div>
                                <input type='number' 
                                    min='0'
                                    max='100'
                                    defaultValue={t.motivation.toString()} 
                                    onBlur={e => updateRow(i, {motivation: Number(e.target.value)})}/>
                                <br/>
                                <TimeInput value={timeLeft} 
                                    countdownOnSet
                                    onZero={() => onTimerOver(t.done)}
                                    onValueChange={n => updateRow(i, {deadline: n ? new Date(Date.now() + n*1000).toLocaleString() : null})}/>
                            </div>
                            <div>
                                <input type='checkbox'
                                    checked={t.done}
                                    onChange={() => {
                                        updateRow(i, {done: !t.done});
                                    }}/>
                                {user && 
                                    t.deadline && 
                                    new Date(t.deadline).getTime() > Date.now() && 
                                    <button onClick={() => updateRow(i, {text: !t.text})}>{t.text ? 'Don\'t text' : 'Text Me'}</button> || <></>}
                                <input type='button' value='x' onClick={() => removeRow(tasks[i])}/>
                            </div>
                        </div>
                    </div>;
                })}
            </div>)
            || 
            <></>
        }
        <input type='button' value='Add' onClick={() => addRow()}/>
    </div>;
}