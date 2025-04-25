'use client'

import usePlanner, { PlannerData } from './usePlanner';
import TaskList from './TaskList';
import TaskSaver from './TaskSaver';

import styles from './planner.module.css';


export default function Planner({initPlannerData}: {initPlannerData?: PlannerData}) {
    const {plannerData, setPlannerData} = usePlanner(() => initPlannerData);

    return <>
        <div className={styles.planner}>
            <h2>Daily Planner</h2>
            <TaskList plannerData={plannerData} onSetPlannerData={setPlannerData}>
                <TaskSaver plannerData={plannerData} onSetPlannerData={setPlannerData}/>
            </TaskList>
        </div>
    </>;
}