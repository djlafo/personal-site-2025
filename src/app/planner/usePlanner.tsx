'use client'

import { useState } from "react";

export interface Task {
    label: string;
    motivation: number;
    UUID: string;
    done: boolean;
    deadline: number;
}
export interface PlannerData {
    tasks: Task[];
}
interface UsePlannerReturn {
    plannerData: PlannerData;
    addTask: (t: Task) => void;
    removeTask: (t: Task) => void;
    sort: () => void;
    setTasks: (ta: Task[]) => void;
    setPlannerData: (pd?: PlannerData) => void;
}

export function getEmptyPlanner(): PlannerData {
    return {
        tasks: []
    };
};

export default function usePlanner(setter ?: () => PlannerData | undefined) {
    const [plannerData, _setPlannerData] = useState<PlannerData>((setter && setter()) || getEmptyPlanner());

    function appendToPlannerData(data: Partial<PlannerData>) {
        return Object.assign(data, Object.create(plannerData));
    }
    
    const addTask = (t: Task) => {
        _setPlannerData(pd => {
            return appendToPlannerData({
                tasks: pd.tasks.concat([t])
            });;
        });
    };

    const removeTask = (t: Task) => {
        _setPlannerData(pd => {
            const c = pd.tasks.slice();
            c.splice(pd.tasks.indexOf(t), 1);
            return appendToPlannerData({
                tasks: c
            });
        });
    };

    const sort = () => {
        _setPlannerData(pd => {
            let copy = pd.tasks.slice();
            copy = copy.sort((a, b) => {
                const motDiff = b.motivation - a.motivation;
                return motDiff;
            });
            const done: Task[] = [];
            const undone: Task[] = [];
            const timed: Task[] = [];
            copy.forEach(c => {
                if(c.done) {
                    done.push(c);
                } else if (c.deadline) {
                    timed.push(c);
                } else {
                    undone.push(c);
                }
            });
            copy = [...timed, ...undone, ...done];
            return appendToPlannerData({
                tasks: copy
            });
        });
    }

    const setTasks = (ta: Task[]) => _setPlannerData(() => appendToPlannerData({
        tasks: ta
    }));

    const setPlannerData = (pd?: PlannerData) => _setPlannerData(pd || getEmptyPlanner());

    const ret: UsePlannerReturn = {
        plannerData,
        addTask,
        removeTask,
        sort,
        setTasks,
        setPlannerData
    };
    return ret;
}