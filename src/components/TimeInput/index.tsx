import React, { useState, useRef, ComponentProps } from 'react';
import './timeinput.css';

type valueChangeFunction = (n : number) => void;

const calculateTime = (s : string) : number => {
    const parts : Array<string> = s.split(' ');
    
    let timeCalc = 0;
    if(parts.length > 0) {
        parts.forEach((p) => {
            let multiplier = 0;
            if(p.length > 0) {
                switch(p.charAt(p.length-1).toLowerCase()) {
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

const calculateString = (n : number) : string => {
    let minutes = Math.floor(n / 60);
    const seconds = n % 60;
    const hours = Math.floor(minutes / 60);
    minutes -= hours*60;
    return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m ` : '' }${seconds}s`;
};

interface TimeProps extends ComponentProps<'input'> {
    value?: number; 
    onValueChange?: valueChangeFunction;
    countdownOnSet?: boolean;
    onZero?: () => void;
}
function TimeInput({ value, onValueChange, countdownOnSet, onZero, ...props }: TimeProps ) {
    // const [remainingTime, setRemainingTime] = useState(1500);
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
        if(onValueChange) onValueChange(v);
        if(countdownOnSet) startCountdown(v);
    }
    const startCountdown = (v : number) => {
        if(!v) return;
        const now = Number(new Date());
        const handler: TimerHandler = () => {
            setInternalValue(Math.floor(((v*1000) - (Number(new Date()) - now))/1000));
            setTickerFlag(t => !t);
        }
        setTicker(setInterval(handler, 1000));
    }
    const stopCountdown = () => {
        if(!countdownOnSet || !ticker) return;
        clearInterval(ticker);
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

    return <span className='time-input'>
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
        <span className='help-text'>Format 8h 4m 2s</span>
    </span>;

}

export default TimeInput;