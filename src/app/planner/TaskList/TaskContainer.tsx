import { useState } from "react";
import { PlannerData, PlannerRow } from "../usePlanner";
import TaskEditor from "./TaskEditor";
import TaskCard from "./TaskCard";

interface TaskContainerProps {
    task: PlannerRow;
    onSetPlannerData: (pd: PlannerData) => void;
}
export default function TaskContainer({ task, onSetPlannerData }: TaskContainerProps) {
    const [editing, setEditing] = useState(!task.id && task.id !== 0);

    if(editing) {
        return <TaskEditor task={task} 
            onSetPlannerData={onSetPlannerData}
            onFinishEdit={() => setEditing(false)}/>
    } else {
        return <TaskCard task={task} 
            onSetEdit={() => setEditing(true)}/>;
    }
    
}