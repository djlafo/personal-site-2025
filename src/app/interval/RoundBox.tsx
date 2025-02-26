import TimeInput from '@/components/TimeInput';

import styles from './interval.module.css';

interface RoundProps {
    activeRound: boolean;
    time: number;
    roundNumber: number;
    readOnly: boolean;
    setTime: (v: number) => void;
    removeTime: () => void;
    addTime: () => void;
    setRound: () => void;
}

function RoundBox({ activeRound, time, roundNumber, readOnly, setTime, removeTime, addTime, setRound}: RoundProps) {
    return <div className={activeRound ? 'active-round' : ''}>
        <div className={styles.roundtitle}>
            Round {roundNumber+1}
            {   
                !readOnly && <span className={styles.roundbuttons}>
                    <input type='button' value='-' onClick={() => removeTime()} />
                    <input type='button' value='+' onClick={() => addTime()}/>
                </span>
            }
        </div>
        <TimeInput value={time} readOnly={readOnly} onValueChange={v => setTime(v)} required/>
        {(!readOnly && !activeRound && <input type='button' value='Select' onClick={() => setRound()}></input>) || <span/>}
    </div>;
}

export default RoundBox;