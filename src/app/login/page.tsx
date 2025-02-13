'use client'

import { useActionState, useEffect } from 'react';

import { login, register } from '@/actions/auth';

import styles from './login.module.css';

import { UserInfo, useUser } from '@/components/Session';
import { useRouter } from 'next/navigation';

function isUser(obj: any): obj is UserInfo {
    return typeof obj === 'object' && obj.username;
}
function isError(obj: any): obj is {error: string} {
    return typeof obj === 'object' && obj.error;
}

export default function Login() {
    const [user, setUser] = useUser();
    const router = useRouter();
    const [loginState, _login] = useActionState(login, undefined);
    const [registerState, _register] = useActionState(register, undefined);

    useEffect(() => {
        if(isUser(loginState) && loginState.username) {
            setUser(loginState);
        } else if(isUser(registerState) && registerState.username) {
            setUser(registerState);
        }
    }, [loginState, registerState]);

    useEffect(() => {
        if(user) router.push('/');
    }, [user]);

    return <div className={styles.login}>
        <h2>
            Login
        </h2>
        <form>
            <input id='username' name='username' placeholder='username' type='text' autoFocus/>

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