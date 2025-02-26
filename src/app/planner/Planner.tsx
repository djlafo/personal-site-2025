'use client'

import usePlanner, { PlannerData } from './usePlanner';
import TaskList from './TaskList';
import TaskSaver from './TaskSaver';

import styles from './planner.module.css';


export default function Planner({initPlannerData}: {initPlannerData?: PlannerData}) {
    const {plannerData, removeTask, sort, setTasks, setPlannerData} = usePlanner(() => initPlannerData);

    return <>
        <div className={styles.planner}>
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