import { useUser } from "@/components/Session";
import { PlannerData, PlannerRow } from "../usePlanner";
import { useState } from "react";
import { createUpdatePlannerRow, deletePlannerRow } from "@/actions/planner";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";

import styles from '../planner.module.css';

interface TaskEditorProps {
    task: PlannerRow;
    onSetPlannerData: (pd: PlannerData) => void;
    onFinishEdit: () => void;
}
export default function TaskEditor({ task, onSetPlannerData, onFinishEdit }: TaskEditorProps) {
    const [user] = useUser();
    const [editedTask, setEditedTask] = useState<PlannerRow>(task);
    const [showDeadline, setShowDeadline] = useState(!!task.deadline);

    const saveRow = async () => {
        if(!editedTask.label) {
            toast.error('Set a label first');
            return;
        }
        const res = await createUpdatePlannerRow(editedTask);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onFinishEdit();
            onSetPlannerData(res);
            // toast.success('Updated');
        }
    }

    const cancel = () => {
        setEditedTask(task);
        onFinishEdit();
    }

    const updateRow = (pt: Partial<PlannerRow>) => {
        let copy = JSON.parse(JSON.stringify(editedTask));
        copy = Object.assign(copy, pt);
        setEditedTask(copy);
    }

    const removeRow = async(pr: PlannerRow) => {
        if(!pr.id) {
            toast.error('This somehow doesn\'t have an ID');
            return;
        }
        const res = await deletePlannerRow(pr.id);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            toast.success('Deleted');
            onSetPlannerData(res);
        }
    }

    const date = editedTask.deadline ? new Date(editedTask.deadline) : new Date();
    const dateString = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return <div className={`${styles.taskCard} ${styles.editing}`}>
        {(editedTask.id || editedTask.id == 0) && <>
            <input type='checkbox'
                id='done'
                name='done'
                className={styles.doneBox}
                checked={editedTask.done}
                onChange={() => {
                    updateRow({done: !editedTask.done});
                }}/>
        </>}

        <span>
            <label htmlFor='motivation'>Importance (0-100) </label>
            <input type='number' 
                id='importance'
                name='importance'
                min='0'
                max='100'
                defaultValue={editedTask.motivation.toString()}
                onBlur={e => updateRow({motivation: Number(e.target.value)})}/>
        </span>

        <textarea rows={8}
            defaultValue={editedTask.label}
            placeholder='Event Label'
            onChange={e => {
                updateRow({label: e.target.value});
            }}/>

        <span>
            <label htmlFor='showdeadline'>Set deadline</label>
            <input type='checkbox'
                id='showdeadline'
                name='showdeadline'
                checked={showDeadline}
                onChange={() => {
                    updateRow({deadline: showDeadline ? null : new Date().toLocaleString()})
                    setShowDeadline(!showDeadline)
                }}/>
        </span>

        {showDeadline && <input type="datetime-local" value={dateString}
            onChange={e => {
                updateRow({deadline: new Date(e.target.value).toLocaleString()})
            }}/>}

        {user && 
            editedTask.deadline && 
            new Date(editedTask.deadline).getTime() > Date.now() && 
            <span>
                <label htmlFor='textmessage'>Text Message</label>
                <input type='checkbox'
                    id='textmessage'
                    name='textmessage'
                    onChange={e => updateRow({text: e.target.checked})}/>
            </span>
        }

        <div className={styles.buttons}>
            <button onClick={saveRow}>Save</button>
            <button onClick={cancel}>Cancel</button>
            {task.id && <button value='x' onClick={() => removeRow(editedTask)}>Remove</button>}
        </div>
    </div>;
}

