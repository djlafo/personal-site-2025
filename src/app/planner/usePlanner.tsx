'use client'

import { getPlannerData } from "@/actions/planner";
import { MyError } from "@/lib/myerror";
import { useState } from "react";
import { toast } from "react-toastify";
import { taskOnDay } from "./helpers";

export interface PlannerRow {
    id?: number;
    plannerId?: number;
    label: string;
    motivation: number;
    done: boolean;
    deadline: string | null;
    textAt: string | null;
    lastText: string | null;
    recurMonths: number;
    recurDays: number;
}
export interface PlannerData {
    tasks: PlannerRow[];
}

type ValuePiece = Date | null;
export type Value = ValuePiece | [ValuePiece, ValuePiece];

export function getEmptyPlanner(): PlannerData {
    return {
        tasks: []
    };
};

export default function usePlanner(setter?: PlannerData | undefined) {
    const [wholePlannerData, setWholePlannerData] = useState<PlannerData>(setter || getEmptyPlanner());
    const [date, _setDate] = useState<Value>(new Date());
    const _filterPlannerData = (pd: PlannerData, _date: Value) => {
        if(_date instanceof Date) {
            const filtered = {tasks: pd.tasks.filter(t => !t.deadline || t.done || taskOnDay(t, _date))};
            return filtered;
        }
        return {tasks: []};
    }
    const [plannerData, _setPlannerData] = useState<PlannerData>(_filterPlannerData(wholePlannerData, date));

    const setPlannerData = (pd?: PlannerData) => {
        const data = pd || getEmptyPlanner();

        setWholePlannerData(data);
        _setPlannerData(_filterPlannerData(data, date));
    }

    const setDate = (v: Value) => {
        _setDate(v);
        // filter on front end for now
        _setPlannerData(_filterPlannerData(wholePlannerData, v));
    }

    const reloadPlannerData = async () => {
        const pd = await getPlannerData();
        if(MyError.isInstanceOf(pd)) {
            toast.error(pd.message);
        } else {
            setPlannerData(pd);
        }
    }

    const ret = {
        plannerData,
        setPlannerData,
        setDate,
        date,
        reloadPlannerData,
        wholePlannerData
    };
    return ret;
}