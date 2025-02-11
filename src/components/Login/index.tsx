'use client'

import { useActionState, useEffect } from 'react';

import { login, register } from '@/actions/auth';

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
    const [loginState, _login] = useActionState(login, undefined);
    const [registerState, _register] = useActionState(register, undefined);

    useEffect(() => {
        if(isUser(loginState) && loginState.username) {
            props.onUserChange(loginState);
        } else if(isUser(registerState) && registerState.username) {
            props.onUserChange(registerState);
        }
    }, [loginState, registerState]);

    return <div className={styles.login}>
        <form>
            <input id='username' name='username' placeholder='username' type='text'/>

            <input id='password' name='password' placeholder='password' type='password'/>
            
            <button formAction={_login}>Login</button>
            <button formAction={_register}>Register</button>
            <div>
                {isError(loginState) && loginState.error}<br/>
                {isError(registerState) && registerState.error}
            </div>
        </form>
    </div>;
}