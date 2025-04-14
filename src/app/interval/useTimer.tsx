'use client'

import { useEffect, useState } from 'react';

type timerReturn = [
    {
        times: number[];
        round: number;
        active: boolean;
    },
    {
        nextRound: () => void;
        setTimeAt: (n: number, amount: number) => void;
        setTimeAtN: (start: number, num: number, time: number) => void;
        setRounds: (n: number) => void;
        setRound: (n: number) => void;
        setTimes: React.Dispatch<React.SetStateAction<number[]>>;
        startTimer: () => void;
        stopTimer: () => void;
    }
];

export function useTimer({ onRoundOver }: { onRoundOver: () => void }): timerReturn {
    const [times, _setTimes] = useState([25*60, 5*60, 25*60, 5*60, 25*60, 5*60, 25*60, 25*60]);
    const [round, _setRound] = useState(0);
    const [currentTimer, setCurrentTimer] = useState<number | undefined>();
    const [timerDate, setTimerDate] = useState(() => {
        if(typeof window !== 'undefined') {
            const td = localStorage.getItem('timerDate');
            if(td) return new Date(td);
        }
        return new Date();
    });
    const [, setTimerFlipper] = useState(true);

    useEffect(() => {
        if(typeof window !== 'undefined') {
            const t = localStorage.getItem('times');
            const r = localStorage.getItem('round');
            const td = localStorage.getItem('timerDate');
            const s = localStorage.getItem('stopTime');
            if(t && r) {
                const ti = JSON.parse(t);
                const ro = Number(r);
                if(s) {
                    ti[ro] = Number(s);
                }
                setTimes(ti);
                setRound(ro);
                if(!s && td) {
                    setTimerDate(new Date(td));
                    setCurrentTimer(ti[ro]);
                }
            }
        }
        // eslint-disable-next-line
    }, []);

    const setRounds = (n: number) => {
        setTimes(new Array(n).fill(1500));
    };

    const setTimes = (a: number[] | React.SetStateAction<number[]>) => {
        _setTimes(a);
        if(round > a.length-1) {
            setRound(a.length-1);
        }
    }

    const setRound = (n: number) => {
        if(n >= times.length)
            n = times.length-1;
        if(n < 0)
            n = 0;
        _setRound(n);
    }

    const setTimeAt = (n: number, amount: number) => {
        const copy = times.slice();
        copy[n] = amount;
        setTimes(copy);
    };

    const setTimeAtN = (start: number, num: number, time: number) => {
        setTimes(r => r.map((r,i) => {
            if((i-start) % num === 0 || ( num === 0 && start === i)) {
                return time;
            } else {
                return r;
            }
        }));
    }

    const stopTimer = () => {
        if(!currentTimer) return;
        const currentDate = new Date();
        const dateDiff = Math.floor((currentDate.getTime() - timerDate.getTime()) / 1000);
        const time = currentTimer - dateDiff;
        if(typeof window !== 'undefined') localStorage.setItem('stopTime', time.toString());
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
        const td = new Date();
        if(typeof window !== 'undefined') {
            localStorage.setItem('timerDate', td.toString());
            localStorage.setItem('times', JSON.stringify(times));
            localStorage.setItem('round', round.toString());
            localStorage.setItem('stopTime', '');
        }
        setTimerDate(td);
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
            round,
            active: !!currentTimer
        }, 
        {
            nextRound,
            setTimeAt,
            setTimeAtN,
            setRounds,
            setRound,
            startTimer,
            stopTimer,
            setTimes
        }
    ];
}