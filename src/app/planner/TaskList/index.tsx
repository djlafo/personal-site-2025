'use client'

import { PlannerData, PlannerRow, Value } from "../usePlanner";
import { useState } from "react";

import styles from '../planner.module.css';
import TaskContainer from "./TaskContainer";
import TaskEditor from "./TaskEditor";

interface TaskListProps {
    plannerData: PlannerData;
    onSetPlannerData: (pd: PlannerData) => void;
    date: Value;
}
export default function TaskList({plannerData, onSetPlannerData, date}: TaskListProps) {
    const tasks = plannerData.tasks;

    const timed = tasks.filter(t => t.deadline && !t.done);
    const noTime = tasks.filter(t => !t.deadline && !t.done);
    const done = tasks.filter(t => t.done);

    return <div className={styles.tasklist}>
        <NewTask date={date} onSetPlannerData={onSetPlannerData}/>
        {timed.length && <>
            <span>Timed</span>
            <div>
                    {timed.map(t => {
                        return <TaskContainer key={`${t.id}-${t.motivation}`} 
                            task={t} 
                            onSetPlannerData={onSetPlannerData}/>
                    })}
            </div>
            </>
            || 
            <></>
        }
        {noTime.length && <>
                <span>Anytime</span>
                <div>
                            {noTime.map(t => {
                                return <TaskContainer key={`${t.id}-${t.motivation}`} 
                                    task={t} 
                                    onSetPlannerData={onSetPlannerData}/>
                            })}
                </div>
            </>
            || 
            <></>
        }
        {done.length && <>
            <span>Done</span>
            <div>
                    {done.map(t => {
                        return <TaskContainer key={`${t.id}-${t.motivation}`} 
                            task={t} 
                            onSetPlannerData={onSetPlannerData}/>
                    })}
            </div>
            </>
            || 
            <></>
        }
    </div>;
}

interface NewTaskProps {
    onSetPlannerData: (pd: PlannerData) => void;
    date: Value;
}
function NewTask({ onSetPlannerData, date }: NewTaskProps) {
    const [task, setTask] = useState<PlannerRow | null>(null);

    const newTask = () => {
        const deadline = (date instanceof Date) ? new Date(date).toLocaleString() : null;
        setTask({
            label: '',
            motivation: 0,
            done: false,
            deadline: deadline,
            text: false
        });
    }

    return <>
        {task && <span>New</span>}
        <div>
            {task && <TaskEditor task={task} onSetPlannerData={onSetPlannerData} onFinishEdit={() => setTask(null)}/>}
            {!task && <input type='button' value='Add' onClick={() => newTask()}/>}
        </div>
    </>;
}
