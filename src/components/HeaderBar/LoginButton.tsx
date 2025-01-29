'use client'

import { useState } from 'react';

import { logout } from '@/actions/auth';

import Login, { UserInfo } from '@/components/Login';
import Modal from '@/components/Modal';

export default function LoginButton() {
    const [opened, setOpened] = useState(false);
    const [user, setUser] = useState<UserInfo | null>();

    const onUserChange = (u: UserInfo | null) => {
        setOpened(false);
        setUser(u);
    }

    const _logout = () => {
        logout().then(() => {
            setUser(null);
        });
    }

    return <div>
        {
            (!!user && <span>{user.username} <input type='button' value='Logout' onClick={() => _logout()}/></span>) ||
            (!user && <input type='button' value='Login' onClick={() => setOpened(true)}/>)
        }
        <Modal styleOne opened={opened} onClose={() => setOpened(false)}>
            <Login onUserChange={onUserChange}/>
        </Modal>
    </div>
}