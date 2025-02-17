'use client'

import { useEffect, useState } from "react";
import { PlannerData, Task } from "./UsePlanner";

import TimeInput from '@/components/TimeInput';

import styles from './planner.module.css';

const TEXTAREA_PADDING = 5;

const onTimerOver = (done: boolean) => {
    if(done) return;
    const a = new Audio('/timer-alert.mp3');
    a.play();
    alert('Deadline reached!');
}

interface TaskListProps {
    plannerData: PlannerData
    onRemove: (t : Task) => void;
    onUpdate: (ta : Array<Task>) => void;
    children: React.ReactNode;
}
export default function TaskList({plannerData, onRemove, onUpdate, children} : TaskListProps) {
    const tasks = plannerData.tasks;

    const addRow = () => {
        onUpdate(tasks.concat([{
            UUID: crypto.randomUUID(),
            label: '',
            motivation: 0,
            done: false,
            deadline: 0
        }]));
    }

    const updateRow = (ind : number, pt : Partial<Task>) => {
        const tcc = JSON.parse(JSON.stringify(tasks));
        tcc.splice(ind, 1, Object.assign(tcc[ind], pt));
        onUpdate(tcc);
    }

    const anyChecked = () => {
        return tasks.some(t => t.done);
    }

    const checkAll = (checked : boolean) => {
        const tcc = tasks.slice();
        tcc.map(t => {
            return Object.assign(t, {done: checked});
        });
        onUpdate(tcc);
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

                    const overdue = t.deadline ? t.deadline - Date.now() < 0 : false;
                    const timeLeft = t.deadline && !overdue ? Math.floor((t.deadline - Date.now())/1000) : 0;

                    return <div key={t.UUID} 
                        className={`${styles.taskcell} ${t.done ? styles.done : ''} ${overdue ? styles.overdue : ''} ${t.deadline && !overdue ? styles.timed : ''}`}>        
                        <textarea rows={1}
                            autoFocus={i === tasks.length - 1}
                            value={t.label} 
                            onChange={e => {
                                updateRow(i, {label: e.target.value});
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight + TEXTAREA_PADDING}px`;
                            }}/>
                        <div className={styles.taskdetails}>
                            <div>
                                <input type='number' 
                                    min='0'
                                    max='100'
                                    value={t.motivation.toString()} 
                                    onChange={e => updateRow(i, {motivation: Number(e.target.value)})}/>
                                <br/>
                                <TimeInput value={timeLeft} 
                                    countdownOnSet
                                    onZero={() => onTimerOver(t.done)}
                                    onValueChange={n => updateRow(i, {deadline: n ? Date.now() + n*1000 : 0})}/>
                            </div>
                            <div>
                                <input type='checkbox'
                                    checked={t.done}
                                    onChange={e => {
                                        updateRow(i, {done: !t.done});
                                    }}/>
                                <input type='button' value='x' onClick={() => onRemove(tasks[i])}/>
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