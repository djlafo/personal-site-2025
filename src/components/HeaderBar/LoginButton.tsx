'use client'

import { useState } from 'react';

import { logout } from '@/actions/auth';

import Login from '@/components/Login';
import Modal from '@/components/Modal';
import { UserInfo, useUser } from '@/components/Session';
import { redirect } from 'next/navigation';

import styles from './headerbar.module.css';

export default function LoginButton() {
    const [opened, setOpened] = useState(false);
    const [user, setUser, pending] = useUser();

    const onUserChange = (u?: UserInfo) => {
        setOpened(false);
        setUser(u);
    }

    const _logout = () => {
        logout().then(() => {
            setUser();
            redirect('/');
        });
    }

    return <div className={styles.loginbutton}>
        {
            (!pending && !!user && <span>{user.username} <input type='button' value='Logout' onClick={() => _logout()}/></span>) ||
            (!pending && !user && <input type='button' value='Login' onClick={() => setOpened(true)}/>)
        }
        <Modal styleOne opened={opened} onClose={() => setOpened(false)}>
            <Login user={user} onUserChange={onUserChange}/>
        </Modal>
    </div>
}