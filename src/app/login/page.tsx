'use client'

import { useActionState, useState } from 'react';

import { login, register } from '@/actions/auth';

import styles from './login.module.css';

import { UserInfo } from '@/components/Session';
import { useRouter, useSearchParams } from 'next/navigation';

function isUser(obj: any): obj is UserInfo {
    return typeof obj === 'object' && obj.username;
}
function isError(obj: any): obj is {error: string} {
    return typeof obj === 'object' && obj.error;
}

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loginState, _login] = useActionState(login, undefined);
    const [lastLoginState, setLastLoginState] = useState(loginState);

    const [registerState, _register] = useActionState(register, undefined);
    const [lastRegisterState, setLastRegisterState] = useState(registerState);

    const redirect = () => {
        const redirect = searchParams.get('redirect');
        router.push(redirect || '/');
    }

    if(lastLoginState !== loginState) {
        if(isUser(loginState) && loginState.username) {
            redirect();
        }
        setLastLoginState(loginState);
    } else if (lastRegisterState !== registerState) {
        if(isUser(registerState) && registerState.username) {
            redirect();
        }
        setLastRegisterState(registerState);
    }

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