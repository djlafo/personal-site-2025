import { useState } from 'react';
import TimeInput from '@/components/TimeInput';

import styles from './interval.module.css';

type onSetFunction = (start : number, num : number, time : number) => void;
type roundsFunction = (n: number) => void;

function Insert({onSet, changeRounds, readOnly} : {onSet: onSetFunction, changeRounds: roundsFunction, readOnly?: boolean}) {
    const [num, setNum] = useState(0);
    const [time, setTime] = useState(0);
    const [start, setStart] = useState(1);
    const [hidden, setHidden] = useState(true);

    const fireOnSet = () => {
        onSet(start-1, num, time);
    }

    const toggleOptions = () => {
        setHidden(!hidden);
    }

    const pomodoro = () => {
        changeRounds(8);
        onSet(0,2,25*60);
        onSet(1,2,5*60);
        onSet(7,0,25*60);
    }

    return <div>
        <input type="button" onClick={toggleOptions} value={`${hidden ? 'Show' : 'Hide'} Advanced Options...`}/>
        <div hidden={hidden} className={styles.insertbox}>
            <div>
                <input disabled={readOnly} 
                    type="button" 
                    value="Set" 
                    onClick={fireOnSet}/> 
                    &nbsp;every&nbsp; 
                <input min="0" 
                    readOnly={readOnly} 
                    value={num} 
                    onChange={e => setNum(Number(e.target.value))} 
                    type="number"/>
                th round to&nbsp;
                <TimeInput value={time} 
                    onValueChange={setTime}/> 
                &nbsp;starting at cell&nbsp;
                <input min="1"
                    readOnly={readOnly} 
                    value={start} 
                    onChange={e => setStart(Number(e.target.value))} 
                    type="number"/>
            </div>
            <div>
                <input disabled={readOnly} type="button" value="Pomodoro" onClick={pomodoro}/>
            </div>
        </div>
    </div>;
}

export default Insert;