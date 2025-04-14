'use client'

import { useState } from 'react';

import { logout } from '@/actions/auth';

import { useUser } from '@/components/Session';
import { usePathname, useRouter } from 'next/navigation';

import styles from './headerbar.module.css';
import Link from 'next/link';

export default function LoginButton() {
    const [user, setUser, pending] = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const _logout = () => {
        logout().then(() => {
            setUser();
            router.push('/');
        });
    }

    return <div className={styles.loginbutton}>
        {
            (!pending && !!user && 
                <span>
                    {user.username}&nbsp;
                    <Timer endTime={user.exp}/>&nbsp;
                    <input type='button' 
                        value='Logout'
                        onClick={() => _logout()}/>
                </span>) 
            ||
            (!pending && !user && 
                <Link href={`/login?redirect=${pathname}`}>Login</Link>)
        }
    </div>
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