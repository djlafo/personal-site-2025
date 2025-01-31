'use client'
import { ToastContainer } from 'react-toastify';

import usePlanner, { PlannerData } from './UsePlanner';
import TaskList from './TaskList';
import TaskSaver, { load } from './TaskSaver';

import styles from './planner.module.css';


export default function Planner({initPlannerData} : {initPlannerData?: PlannerData}) {
    const {plannerData, removeTask, sort, setTasks, setPlannerData} = usePlanner(() => {
        if(initPlannerData) return initPlannerData;
        return load();
    });

    return <>
        <div className={styles.planner}>
            <ToastContainer/>
            <h2>Daily Planner</h2>
            <TaskList plannerData={plannerData} onRemove={removeTask} onUpdate={setTasks}>
                {
                    (plannerData.tasks.length > 1 && <input type='button' value='Sort' onClick={() => sort()}/>) || <></>
                }
                <TaskSaver plannerData={plannerData} onLoad={setPlannerData}/>
            </TaskList>
        </div>
    </>;
}