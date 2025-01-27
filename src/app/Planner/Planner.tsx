import { useState } from "react";

export interface Task {
    label : string;
    motivation: number;
    UUID: number;
    done: boolean;
    deadline: number;
}
interface UsePlannerReturn {
    tasks : Array<Task>;
    addTask : (t : Task) => void;
    removeTask : (t : Task) => void;
    sort : () => void;
    setTasks : (ta : Array<Task>) => void;
}
export default function usePlanner(setter ?: () => Array<Task>) {
    const [tasks, _setTasks] = useState<Array<Task>>((setter && setter()) || []);

    const addTask = (t : Task) => {
        _setTasks(ta => {
            return ta.concat([t]);
        });
    };

    const removeTask = (t : Task) => {
        _setTasks(ta => {
            const c = ta.slice();
            c.splice(ta.indexOf(t), 1);
            return c
        });
    };

    const sort = () => {
        _setTasks(ta => {
            let copy = ta.slice();
            copy = copy.sort((a, b) => {
                const motDiff = b.motivation - a.motivation;
                return motDiff;
            });
            const done : Array<Task> = [];
            const undone : Array<Task> = [];
            const timed : Array<Task> = [];
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
            return copy;
        });
    }

    const setTasks = (ta : Array<Task>) => _setTasks(ta);

    const ret : UsePlannerReturn = {
        tasks, 
        addTask,
        removeTask,
        sort,
        setTasks
    };
    return ret;
}