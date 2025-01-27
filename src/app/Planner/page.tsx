'use client'

import usePlanner from './Planner';
import TaskList from './TaskList';
import TaskSaver, { load } from './TaskSaver';

import styles from './planner.module.css';


export default function Planner() {
    const {tasks, removeTask, sort, setTasks} = usePlanner(load);

    return <>
        <div className={styles.planner}>
            <h2>Daily Planner</h2>
            <TaskList tasks={tasks} onRemove={removeTask} onUpdate={setTasks}>
                {
                    (tasks.length > 1 && <input type='button' value='Sort' onClick={() => sort()}/>) || <></>
                }
                <TaskSaver tasks={tasks} onLoad={setTasks}/>
            </TaskList>
        </div>
    </>;
}