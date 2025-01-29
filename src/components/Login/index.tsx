'use client'

import { useActionState, useEffect } from 'react';

import { login } from '@/actions/auth';

import styles from './login.module.css';

import { UserInfo } from '@/components/Session';

function isUser(obj: any): obj is UserInfo {
    return typeof obj === 'object' && obj.username;
}
function isError(obj: any): obj is {error: string} {
    return typeof obj === 'object' && obj.error;
}

export interface LoginProps {
    onUserChange: (u?: UserInfo) => void;
    user?: UserInfo;
}
export default function Login(props: LoginProps) {
    const [state, action, pending] = useActionState(login, undefined);

    useEffect(() => {
        if(isUser(state) && state.username) {
            props.onUserChange(state);
        }
    }, [state]);

    return <div className={styles.login}>
        <form action={action}>
            <input id='username' name='username' placeholder='username' type='text'/>

            <input id='password' name='password' placeholder='password' type='password'/>
            
            <input type='submit' value='Login'/>
            <div>
                {isError(state) && state.error}
            </div>
        </form>
    </div>;
}