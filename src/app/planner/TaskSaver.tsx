'use client'

import { clearPlannerValues, deleteAllPlannerRows } from "@/actions/planner";
import { PlannerData } from "./usePlanner";
import { toast } from "react-toastify";
import { MyError } from "@/lib/myerror";


interface TaskSaverProps {
    plannerData: PlannerData;
    onSetPlannerData: (pd: PlannerData) => void;
}

export default function TaskSaver({plannerData, onSetPlannerData}: TaskSaverProps) {
    const clearValues = async () => {
        const res = await clearPlannerValues();
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onSetPlannerData(res);
            toast.success('Cleared');
        }
    }

    const clearRows = async () => {
        const res = await deleteAllPlannerRows();
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            onSetPlannerData(res);
            toast.success('Deleted');
        }
    }

    return <>
        {
            (plannerData.tasks.length !== 0 && <>
                <span>
                    <label>Clear</label>
                    <input type='button' value='Rows' onClick={() => clearRows()}/>
                    <input type='button' value='Times&Values' onClick={() => clearValues()}/>
                </span>
            </>) || <></>
        }
    </>
}