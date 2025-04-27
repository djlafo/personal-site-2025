import React, { useState, useRef, ComponentProps, useEffect } from 'react';
import './timeinput.css';

type valueChangeFunction = (n: number) => void;

const calculateTime = (s: string): number => {
    const parts: string[] = s.split(' ');
    
    let timeCalc = 0;
    if(parts.length > 0) {
        parts.forEach((p) => {
            let multiplier = 0;
            if(p.length > 0) {
                switch(p.charAt(p.length-1).toLowerCase()) {
                    case 'd':
                        multiplier = 60*60*24;
                    break;
                    case 'h':
                        multiplier = 60*60;
                    break;
                    case  'm':
                        multiplier = 60;
                    break;
                    case 's': 
                        multiplier = 1;
                    break;
                }
                if(multiplier === 0) {
                    timeCalc = 0;
                    return;
                }
                const num = Number(p.substring(0, p.length-1));
                timeCalc += num * multiplier || 0;
            }
        });
    }
    return timeCalc;
};

const calculateString = (n: number): string => {
    let minutes = Math.floor(n / 60);
    const seconds = n % 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours*60;
    const days = Math.floor(hours / 24);
    hours -= days*24;
    return `${days ? `${days}d ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : '' }${seconds}s`;
};

export interface TimeProps extends ComponentProps<'input'> {
    value?: number; 
    onValueChange?: valueChangeFunction;
    countdownOnSet?: boolean;
    noInput?: boolean;
    onZero?: () => void;
}
export default function TimeInput({ value, onValueChange, noInput, countdownOnSet, onZero, ...props }: TimeProps ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [remainingTimeText, setRemainingTimeText] = useState('');
    const [internalValue, setInternalValue] = useState<number | null>();
    const [lastValue, setLastValue] = useState<number | undefined>();

    const [ticker, setTicker] = useState<number | null>();
    const [, setTickerFlag] = useState(false);
    const [editing, setEditing] = useState(false);

    const alertValueChange = (s: string) => {
        setEditing(false);
        const v = calculateTime(s);
        if(v !== internalValue && onValueChange) {
            onValueChange(v);
        }
        setRemainingTimeText(calculateString(v));
    }
    const startCountdown = (v: number) => {
        if(!v) return;
        setTicker(v);
    }
    const stopCountdown = () => {
        if(!countdownOnSet || !ticker) return;
        setTicker(null);
        setInternalValue(null);
    }

    if(lastValue !== value) {
        if(!value && ticker) stopCountdown();
        setLastValue(value);
        setInternalValue(value);
        setRemainingTimeText(calculateString(value || 0));
        if(!ticker && value && countdownOnSet) startCountdown(value);
    } else if(!editing) {
        if(countdownOnSet && ticker) {
            if(internalValue && (internalValue < 0 || internalValue === 0)) {
                setRemainingTimeText(calculateString(0));
                stopCountdown();
                if(onZero && value !== 0) onZero();
            } else if(internalValue) {
                const internalRemaining = calculateString(internalValue);
                if(internalRemaining!==remainingTimeText) {
                    setRemainingTimeText(internalRemaining);
                }
            }
        }
    }

    useEffect(() => {
        if(!ticker) return;

        const now = Number(new Date());
        const handler: TimerHandler = () => {
            setInternalValue(Math.floor(((ticker*1000) - (Number(new Date()) - now))/1000));
            setTickerFlag(t => !t);
        }
        const int = setInterval(handler, 1000);
        return () => {
            clearInterval(int);
        }
    }, [ticker])

    return !noInput ? <span className='time-input'>
        <input type="text" 
            value={remainingTimeText} 
            onChange={e => setRemainingTimeText(e.target.value)} 
            onFocus={() => {
                setEditing(true);
                stopCountdown();
            }}
            onBlur={e => alertValueChange(e.target.value)} 
            ref={inputRef} 
            {...props}/>
        {!props.readOnly && <span className='help-text'>Format 2d 8h 4m 2s</span>}
    </span> : remainingTimeText;

}