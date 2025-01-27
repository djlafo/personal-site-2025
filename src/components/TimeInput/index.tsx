import React, { useState, useRef, ComponentProps } from 'react';
import './timeinput.css';

type valueChangeFunction = (n : number) => void;

const calculateTime = (s : string) : number => {
    const parts : Array<string> = s.split(' ');
    
    let timeCalc = 0;
    if(parts.length > 0) {
        parts.forEach((p,i) => {
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
    value? : number; 
    onValueChange? : valueChangeFunction;
    required? : boolean;
}
function TimeInput({ value, onValueChange, required, ...props } : TimeProps ) {
    // const [remainingTime, setRemainingTime] = useState(1500);
    const inputRef = useRef<HTMLInputElement>(null);
    const [remainingTimeText, setRemainingTimeText] = useState('');
    const [lastValue, setLastValue] = useState<number>();

    const alertValueChange = (s : string) => {
        const v = calculateTime(s);
        onValueChange && onValueChange(v);
        const remainingText = calculateString(v);
        setRemainingTimeText(remainingText);
    }

    if((value || value === 0) && value >= 0 && value !== lastValue) {
        setLastValue(value);
        const remainingText = calculateString(value);
        setRemainingTimeText(remainingText);
    }

    return <span className='time-input'>
        <input type="text" value={remainingTimeText} onChange={e => setRemainingTimeText(e.target.value)} onBlur={e => alertValueChange(e.target.value)} ref={inputRef} {...props}/>
        {
            <span className='help-text'>Format 8h 4m 2s</span>
            // (invalid && <span className='error-text'>Invalid unit</span>)
        }
    </span>;

}

export default TimeInput;