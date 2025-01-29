'use client'

import { useActionState, useEffect } from 'react';
import { redirect } from 'next/navigation';

import { login } from '@/actions/auth';

import styles from './login.module.css';

export interface UserInfo {
    username: string
}
export interface LoginProps {
    onUserChange: (u: UserInfo | null) => void;
}
export default function Login(props: LoginProps) {
    const [state, action, pending] = useActionState(login, undefined);

    function isUser(obj: any): obj is UserInfo {
        return typeof obj === 'object' && obj.username;
    }

    useEffect(() => {
        if(isUser(state) && state?.username) {
            //
            props.onUserChange(state);
        }
    }, [state]);

    return <div className={styles.login}>
        <form action={action}>
            <div>
                <input id='username' name='username' placeholder='username'/>
            </div>

            <div>
                <input id='password' name='password' placeholder='password' type='password'/>
            </div>
            
            <div>
                <input type='submit' value='Login'/>
                <span>
                    {state?.error}
                </span>
            </div> 
        </form>
    </div>;
}