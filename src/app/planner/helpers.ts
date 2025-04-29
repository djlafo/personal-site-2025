import { PlannerRow } from "./usePlanner";

export function taskOnDay(task: PlannerRow, date: Date): boolean {
    if(task.deadline) {
        if(task.recurMonths && task.recurDays) return false;
        if((new Date(task.deadline).getTime()-(1000*60*60*24)) > date.getTime()) return false;
        if(task.recurMonths) {
            return new Date(task.deadline).getDate() === date.getDate();
        } else if (task.recurDays) {
            const timeDiff = Math.abs(new Date(task.deadline).getTime() - date.getTime());
            const days = Math.floor(timeDiff / (1000*60*60*24));
            return Number.isInteger(days / task.recurDays);
        }
        return !!(task.deadline && !task.done && new Date(task.deadline).toDateString() === date.toDateString());
    } else {
        return false;
    }
}

export function getNextDeadlineAndText(task: PlannerRow) {
    return {
        deadline: task.deadline ? getNextDeadline(task, task.deadline) : null,
        textAt: task.textAt ? getNextText(task) : null
    };
}

function getNextDeadline(task: PlannerRow, dateString: string) {
    let endDate: Date = new Date(dateString);
    const currentDate = new Date();
    if(task.recurMonths && task.recurDays) {
        return;
    } else if (task.recurMonths) {
        const deadDate = new Date(dateString);
        const deadNum = deadDate.getFullYear() + (deadDate.getMonth()/12);
        const interval = task.recurMonths/12;
        // console.log(`INTERVAL ${interval}`);
        const currentNum = currentDate.getFullYear() + (currentDate.getMonth()/12);
        // console.log(`CURRENTNUM [${currentNum}] TEXTNUM [${textNum}]`);
        const intervals = (currentNum - deadNum) / interval;
        let prev = deadNum + (intervals * interval);
        const calcPrevDate = (addIntervals: number) => {
            prev += (interval*addIntervals);
            const prevYear = Math.floor(prev);
            const dateString = `${prevYear}/${Math.round((prev-prevYear)*12 + 1).toString().padStart(2, '0')}/${deadDate.getDate()} ${deadDate.getHours()}:${deadDate.getMinutes().toString().padStart(2, '0')}`;
            // console.log(`DATE STRING [${dateString}]`);
            return new Date(dateString);    
        }
        let prevDate = calcPrevDate(0);
        // console.log(`PREVIOUS DATE [${prevDate.toLocaleString()}] CURRENT DATE [${currentDate.toLocaleString()}]`);
        if(prevDate.getTime() < currentDate.getTime()) {
            prevDate = calcPrevDate(1);
        }
        return prevDate;
    } else if (task.recurDays) {
        const textTime = endDate.getTime();
        const dayTime = task.recurDays * (1000*60*60*24);
        const diff = currentDate.getTime() - textTime;
        const intervals = Math.floor(diff/dayTime);
        endDate = new Date(textTime + (dayTime * (intervals + 1)));
    }
    return endDate;
}

function getNextText(task: PlannerRow) {
    if(!task.textAt) return null;
    if(!task.lastText) {
        return new Date(task.textAt);
    } else if (task.lastText ) {
        let endDate: Date = new Date(task.textAt);
        const lastDate = new Date(task.lastText);
        const currentDate = new Date();
        if(task.recurMonths && task.recurDays) {
            return;
        } else if (task.recurMonths) {
            const textDate = new Date(task.textAt);
            const textNum = textDate.getFullYear() + (textDate.getMonth()/12);
            const interval = task.recurMonths/12;
            // console.log(`INTERVAL ${interval}`);
            const currentNum = currentDate.getFullYear() + (currentDate.getMonth()/12);
            // console.log(`CURRENTNUM [${currentNum}] TEXTNUM [${textNum}]`);
            const intervals = (currentNum - textNum) / interval;
            let prev = textNum + (intervals * interval);
            const calcPrevDate = (addIntervals: number) => {
                prev += (interval*addIntervals);
                const prevYear = Math.floor(prev);
                const dateString = `${prevYear}/${Math.round((prev-prevYear)*12 + 1).toString().padStart(2, '0')}/${textDate.getDate()} ${textDate.getHours()}:${textDate.getMinutes().toString().padStart(2, '0')}`;
                // console.log(`DATE STRING [${dateString}]`);
                return new Date(dateString);    
            }
            let prevDate = calcPrevDate(0);
            // console.log(`PREVIOUS DATE [${prevDate.toLocaleString()}] CURRENT DATE [${currentDate.toLocaleString()}]`);
            if(prevDate.getTime() > currentDate.getTime()) {
                prevDate = calcPrevDate(-1);
            }
            if(lastDate.getTime() < prevDate.getTime()) {
                endDate = prevDate;
            } else {
                endDate = calcPrevDate(1);
            }
        } else if (task.recurDays) {
            const textTime = endDate.getTime();
            const dayTime = task.recurDays * (1000*60*60*24);
            const diff = currentDate.getTime() - textTime;
            const intervals = Math.floor(diff/dayTime);
            const currentInterval = textTime + (dayTime * (intervals));
            if(currentInterval > lastDate.getTime()) {
                endDate = new Date(currentInterval);
            } else {
                endDate = new Date(textTime + (dayTime * (intervals + 1)));
            }
        }
        return endDate;
    }
}