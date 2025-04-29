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

    const deadlines = getNextDeadlineAndText(task);

    return <div className={`${styles.taskCard} ${task.done ? styles.done : ''} ${overdue ? styles.overdue : ''} ${task.deadline && !overdue ? styles.timed : ''} ${task.motivation === 0 ? styles.unimportant : ''}`}>
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
                <TimeInput value={Math.floor((deadlines.deadline.getTime() - Date.now())/1000)} 
                    noInput
                    onZero={() => onTimerOver(task.done)}
                    countdownOnSet/>
                <span>
                    Date: {deadlines.deadline.toLocaleString('en-US')}
                </span>
            </>}
            {task.recurMonths && task.recurDays && <span>
                Invalid recur setup
            </span> || <></>}
            {task.recurMonths && <span>
                Repeats every {task.recurMonths} months
            </span> || <></>}
            {task.recurDays && <span>
                Repeats every {task.recurDays} days
            </span> || <></>}
            {deadlines.textAt && <span>
                Text at: {deadlines.textAt.toLocaleString('en-US')}
            </span>}
            {task.lastText && <span>
                Last text: {new Date(task.lastText).toLocaleString('en-US')}
            </span>}
        </div>
    </div>
}