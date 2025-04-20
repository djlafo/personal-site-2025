'use client'
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import LoginButton from './LoginButton';

import styles from './headerbar.module.css';
import { useUser } from '../Session';

export default function HeaderBar() {
	const [user] = useUser();

	return <div className={styles.headerbar}>
		<HamburgerMenu/>
		<div className={styles.nameHeader}>
			{user && <>
					<Timer endTime={user.exp}/>&nbsp;
					{user.username}&nbsp;
				</>
				|| 
				<>
					Dylan Lafont
				</>
			}
		</div>
		<LoginButton/>
	</div>;
}

function Timer({endTime}: {endTime: number}) {
    const [timeInterval, setTimeInterval] = useState<number | null>(null);
    const [, setTimeFlipper] = useState(false);
    const [lastTime, setLastTime] = useState<number>(endTime);

    if(endTime != lastTime) {
        if(timeInterval) {
            clearInterval(timeInterval);
        }

        const timerHandler: TimerHandler = () => {
            setTimeFlipper(tf => !tf);
        }
        setTimeInterval(setInterval(timerHandler, 60000));
        setLastTime(endTime);
    }

    const timeLeft = Math.floor(endTime-(Number(new Date())/1000));
    const hours = Math.floor(timeLeft/60/60);
    const minutes = Math.floor(timeLeft/60 - (hours*60));

    return <>{hours}:{minutes.toString().padStart(2, '0')}</>;
}