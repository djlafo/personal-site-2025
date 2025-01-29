'use client'

import Insert from './Insert';
import { useTimer } from './timer';
import RoundBox from './RoundBox';

import styles from './interval.module.css';

function Interval() {
    const [timerData, setTimerData] = useTimer({ onRoundOver: () => {
        const a = new Audio('/timer-alert.mp3');
        a.play();
    }});

    return <>
        <div className={styles.interval}>
            <h1>
                Interval Timer
            </h1>
            <hr/>
            <p>
                Rounds&nbsp;
                <input type="text" value={timerData.times.length || ''} 
                    readOnly={timerData.active} 
                    onChange={e => setTimerData.setRounds(Number(e.target.value))}/>
            </p>
            {
                timerData.times.length > 0 && 
                !timerData.active && 
                <Insert changeRounds={setTimerData.setRounds} 
                    onSet={setTimerData.setTimeAtN} 
                    readOnly={timerData.active}/>
            }
            <div className={`${styles.roundlist} ${timerData.active ? 'active' : ''}`}>
                {
                    timerData.times.map((t, i) => 
                        <RoundBox key={`${i}-${timerData.times[timerData.round]}`}
                            activeRound={i===timerData.round} 
                            time={t} 
                            roundNumber={i} 
                            readOnly={timerData.active}
                            setTime={v => setTimerData.setTimeAt(i, v)}
                            removeTime={() => setTimerData.setTimes(timerData.times.filter((_, ri) => ri !== i))}
                            addTime={() => setTimerData.setTimes([...timerData.times.slice(0, i+1), 0, ...timerData.times.slice(i+1, timerData.times.length)])}
                            setRound={() => setTimerData.setRound(i)}/>)
                }
            </div>
            <p>
                { 
                    (!timerData.active && timerData.times.length > 0 && <span>
                        <input className='big-button' type='button' 
                            value='Save' 
                            onClick={() => setTimerData.setSavedTimes(timerData.times)}/>
                        <input className='big-button' type='button' 
                            value={`Load${timerData.savedTimes.length ? `(${timerData.savedTimes.length})` : '(empty)'}`} 
                            onClick={() => setTimerData.setTimes(timerData.savedTimes)}/>
                        <input className='big-button' type='button' 
                            value='Start' 
                            onClick={() => setTimerData.startTimer()}/>
                    </span>)
                    || 
                    (timerData.active && 
                        <input className='big-button' type='button' 
                            value='Stop' 
                            onClick={() => setTimerData.stopTimer()}/>)
                }
            </p>
        </div>
    </>;
}

export default Interval;