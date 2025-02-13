'use client'

import { useState } from 'react';

import { logout } from '@/actions/auth';

import { useUser } from '@/components/Session';
import { useRouter } from 'next/navigation';

import styles from './headerbar.module.css';

export default function LoginButton() {
    const [user, setUser, pending] = useUser();
    const router = useRouter();

    const _logout = () => {
        logout().then(() => {
            setUser();
            router.push('/');
        });
    }

    return <div className={styles.loginbutton}>
        {
            (!pending && !!user && <span>{user.username} <input type='button' value='Logout' onClick={() => _logout()}/></span>) ||
            (!pending && !user && <input type='button' value='Login' onClick={() => router.push('/login')}/>)
        }
    </div>
}