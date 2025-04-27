'use client'

import usePlanner, { PlannerData, Value } from './usePlanner';
import TaskList from './TaskList';

import styles from './planner.module.css';
import Calendar from 'react-calendar';

export default function Planner({initPlannerData}: {initPlannerData?: PlannerData}) {
    const {plannerData, wholePlannerData, setPlannerData, setDate, date} = usePlanner(initPlannerData);
    return <>
        <div className={styles.planner}>
            <button onClick={() => setDate(new Date())}>Today</button>
            <MyCalendar date={date} plannerData={wholePlannerData} onDateChange={setDate}/>
            <TaskList date={date} plannerData={plannerData} onSetPlannerData={setPlannerData}/>
        </div>
    </>;
}

interface MyCalendarProps {
    onDateChange?: (date: Value) => void;
    date: Value;
    plannerData: PlannerData
}
function MyCalendar({ date, onDateChange, plannerData }: MyCalendarProps) {
    const __setDate = (v: Value) => {
        if(onDateChange) onDateChange(v);
    }

    const _setDate = (v: Value) => {
        if(v instanceof Date && date instanceof Date) {
            if(date.toDateString() === v.toDateString()) {
                __setDate(null);
            } else {
                __setDate(v);
            }
        } else {
            __setDate(v);
        }
    }

    const checkEvent = (pd: PlannerData) => {
        return ({date:_date, view}: {date: Date, view: string}) => {
            const eventFound = pd.tasks.some(t => t.deadline && new Date(t.deadline).toDateString() === _date.toDateString());
            if(view === 'month' && eventFound) {
                return styles.eventDay;
            }
        }
    }

    return <div className={styles.myCalendar}>
        <Calendar value={date} 
            onChange={_setDate}
            tileClassName={checkEvent(plannerData)}/>
    </div>;
}