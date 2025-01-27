import { useState } from 'react';

type timerReturn = [
    {
        times: Array<number>;
        savedTimes: Array<number>;
        round: number;
        active: boolean;
    },
    {
        nextRound: () => void;
        setTimeAt: (n: number, amount: number) => void;
        setTimeAtN: (start: number, num: number, time: number) => void;
        setSavedTimes: React.Dispatch<React.SetStateAction<number[]>>;
        setRounds: (n: number) => void;
        setRound: (n: number) => void;
        setTimes: React.Dispatch<React.SetStateAction<number[]>>;
        startTimer: () => void;
        stopTimer: () => void;
    }
];

export function useTimer({ onRoundOver } : { onRoundOver: () => void }) : timerReturn {
    const [times, _setTimes] = useState([25*60, 5*60, 25*60, 5*60, 25*60, 5*60, 25*60, 25*60]);
    const [savedTimes, setSavedTimes] = useState<Array<number>>([]);
    const [round, _setRound] = useState(0);
    const [currentTimer, setCurrentTimer] = useState<number | undefined>();
    const [timerDate, setTimerDate] = useState(() => new Date());
    const [, setTimerFlipper] = useState(true);

    const setRounds = (n : number) => {
        setTimes(new Array(n).fill(1500));
    };

    const setTimes = (a : Array<number> | React.SetStateAction<Array<number>>) => {
        _setTimes(a);
        if(round > a.length-1) {
            setRound(a.length-1);
        }
    }

    const setRound = (n : number) => {
        if(n >= times.length)
            n = times.length-1;
        if(n < 0)
            n = 0;
        _setRound(n);
    }

    const setTimeAt = (n : number, amount: number) => {
        const copy = times.slice();
        copy[n] = amount;
        setTimes(copy);
    };

    const setTimeAtN = (start : number, num : number, time : number) => {
        setTimes(r => r.map((r,i) => {
            if((i-start) % num === 0 || ( num === 0 && start === i)) {
                return time;
            } else {
                return r;
            }
        }));
    }

    const stopTimer = () => {
        setCurrentTimer(undefined);
    };

    const nextRound = () => {    
        if(round !== times.length - 1) { // if not last timer
            setTimerDate(new Date());
            setCurrentTimer(times[round + 1]);
            _setRound(round + 1);
        } else {
            stopTimer();
        }
        onRoundOver();
    };

    const startTimer = () => {
        setTimerDate(new Date());
        setCurrentTimer(times[round]);
        setTimeout(() => {
            setTimerFlipper(f => !f);
        }, 1000);
    }

    if (currentTimer) {
        const currentDate = new Date();
        const dateDiff = Math.floor((currentDate.getTime() - timerDate.getTime()) / 1000);
        const time = currentTimer - dateDiff;
        if (times[round] !== time) {
            setTimeAt(round, time < 0 ? 0 : time);
            if(time <= 0) {
                nextRound();
            }
            setTimeout(() => {
                setTimerFlipper(f => !f);
            }, 1000);
        }
    }

    return [
        {
            times,
            savedTimes,
            round,
            active : !!currentTimer
        }, 
        {
            nextRound,
            setTimeAt,
            setTimeAtN,
            setSavedTimes,
            setRounds,
            setRound,
            startTimer,
            stopTimer,
            setTimes
        }
    ];
}