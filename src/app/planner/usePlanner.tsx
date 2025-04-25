'use client'

import { useState } from "react";

export interface PlannerRow {
    id: number;
    plannerId: number;
    label: string;
    motivation: number;
    done: boolean;
    deadline: string | null;
    text: boolean;
}
export interface PlannerData {
    tasks: PlannerRow[];
}
interface UsePlannerReturn {
    plannerData: PlannerData;
    setPlannerData: (pd?: PlannerData) => void;
}

export function getEmptyPlanner(): PlannerData {
    return {
        tasks: []
    };
};

export default function usePlanner(setter ?: () => PlannerData | undefined) {
    const [plannerData, _setPlannerData] = useState<PlannerData>((setter && setter()) || getEmptyPlanner());

    const setPlannerData = (pd?: PlannerData) => {
        _setPlannerData(pd || getEmptyPlanner());
    }

    const ret: UsePlannerReturn = {
        plannerData,
        setPlannerData
    };
    return ret;
}