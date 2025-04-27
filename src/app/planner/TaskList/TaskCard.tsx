import { PlannerRow } from "../usePlanner";

import styles from '../planner.module.css';
import dynamic from "next/dynamic";
import Image from 'next/image';
const TimeInput = dynamic(() => import('@/components/TimeInput'), {
    ssr: false
})

const onTimerOver = () => {
    const a = new Audio('/timer-alert.mp3');
    a.play();
    alert('Deadline reached!');
}

interface TaskCardProps {
    task: PlannerRow;
    onSetEdit: () => void;   
}
export default function TaskCard({ task, onSetEdit }: TaskCardProps) {
    const overdue = task.deadline ? new Date(task.deadline).getTime() - Date.now() < 0 : false;

    return <div className={`${styles.taskCard} ${task.done ? styles.done : ''} ${overdue ? styles.overdue : ''} ${task.deadline && !overdue ? styles.timed : ''}`}>
        <div className={styles.header}>
            <div>
                <button onClick={onSetEdit}>Edit</button>
                <span>{task.label || 'No Label'}</span>
            </div>
            <div>
                {task.text && <Image src='/icons/phone.png' alt='Text Enabled' width={18} height={30}/>}
                <span className={styles.motivation}>{task.motivation}</span>
            </div>
        </div>
        
        <div className={styles.body}>
            {task.deadline && <>
                <span>
                    Date: {new Date(task.deadline).toLocaleString('en-US')}
                </span>
                <TimeInput value={Math.floor((new Date(task.deadline).getTime() - Date.now())/1000)} 
                    noInput
                    onZero={onTimerOver}
                    countdownOnSet/>
            </>}
        </div>
    </div>
}