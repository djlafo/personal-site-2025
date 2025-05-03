import { PlannerData, PlannerRow } from "../usePlanner";

import styles from '../planner.module.css';
import dynamic from "next/dynamic";
import Image from 'next/image';
import { createUpdatePlannerRow } from "@/actions/planner";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";
import { getNextDeadlineAndText } from "../helpers";
const TimeInput = dynamic(() => import('@/components/TimeInput'), {
    ssr: false
})

const onTimerOver = (done: boolean) => {
    if(done) return;
    const a = new Audio('/timer-alert.mp3');
    // try {
        a.play();
    // }
}

interface TaskCardProps {
    task: PlannerRow;
    onSetEdit: () => void;   
    onSetPlannerData: (pd: PlannerData) => void;
}
export default function TaskCard({ task, onSetEdit, onSetPlannerData }: TaskCardProps) {
    const overdue = task.deadline && !task.done && !task.recurMonths && !task.recurDays ? new Date(task.deadline).getTime() - Date.now() < 0 : false;

    const setDone = async (b: boolean) => {
        const resp = await createUpdatePlannerRow(Object.assign(task, {done: b}));
        if(MyError.isInstanceOf(resp)) {
            toast.error(resp.message);
        } else {
            onSetPlannerData(resp);
        }
    }

    const toMyDateFormat = (d: Date) => d.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric'});

    const deadlines = getNextDeadlineAndText(task);
    // const red = Math.floor(task.motivation * (15/100)).toString(16); // hex
    // const green = Math.floor(15 - (task.motivation * (15/100))).toString(16); // hex
    return <div className={`${styles.taskCard} ${task.done ? styles.done : ''} ${overdue ? styles.overdue : ''} ${task.deadline && !overdue ? styles.timed : ''}`}
        style={task.motivation === 0 || task.done ? {opacity: .2} : {opacity: (task.motivation / 100) * (7/10) + .3, backgroundColor: '#007777'}}>
        <div className={styles.header}>
            <div>
                <button onClick={onSetEdit}>Edit</button>
                <span>{task.label || 'No Label'}</span>
            </div>
            <div className={styles.motHeader}>
                <input type='checkbox' 
                    defaultChecked={task.done} 
                    onChange={e => setDone(e.target.checked)}/>
                {task.textAt && <Image src='/icons/phone.png' alt='Text Enabled' width={18} height={30}/>}
                <span className={styles.motivation}>{task.motivation}</span>
            </div>
        </div>
        
        <div className={styles.body}>
            {deadlines.deadline && <>
                <b><TimeInput value={Math.floor((deadlines.deadline.getTime() - Date.now())/1000)} 
                    noInput
                    onZero={() => onTimerOver(task.done)}
                    countdownOnSet/></b>
                <span>
                    <b>Date:</b> {toMyDateFormat(deadlines.deadline)}
                </span>
            </>}
            {task.recurMonths && task.recurDays && <span>
                Invalid recur setup
            </span> || <></>}
            {deadlines.textAt && <span>
                <b>Text:</b> {toMyDateFormat(deadlines.textAt)}
            </span>}
            {task.recurMonths && <span>
                <b>Repeats</b> every {task.recurMonths} month(s)
            </span> || <></>}
            {task.recurDays && <span>
                <b>Repeats</b> every {task.recurDays} day(s)
            </span> || <></>}
            {task.lastText && <span>
                <br/><b>Last text:</b> {toMyDateFormat(new Date(task.lastText))}
            </span>}
        </div>
    </div>
}