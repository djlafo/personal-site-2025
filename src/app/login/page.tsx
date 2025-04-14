'use client'

import { useActionState, useEffect, useRef } from 'react';

import { login, register } from '@/actions/auth';

import styles from './login.module.css';

import { UserInfo, useUser } from '@/components/Session';
import { useRouter, useSearchParams } from 'next/navigation';

function isUser(obj: any): obj is UserInfo {
    return typeof obj === 'object' && obj.username;
}
function isError(obj: any): obj is {error: string} {
    return typeof obj === 'object' && obj.error;
}

export default function Login() {
    const [, setUser] = useUser();
    const loginButton = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loginState, _login] = useActionState(login, undefined);
    const [registerState, _register] = useActionState(register, undefined);

    const redirect = (u: UserInfo) => {
        setUser(u);
        const redirect = searchParams.get('redirect');
        router.push(redirect || '/');
    }

    useEffect(() => {
        if(isUser(loginState) && loginState.username) {
            redirect(loginState);
        } else if(isUser(registerState) && registerState.username) {
            redirect(registerState);
        }
        // Don't want this running except after login/register. Will complain about updating
        // eslint-disable-next-line
    }, [loginState, registerState]);

    useEffect(() => {
        const submitForm = (e: KeyboardEvent) => {
            if(e.key === 'Enter') {
                loginButton.current?.click();
            }
        }

        window.addEventListener('keydown', submitForm)
        return () => {
            window.removeEventListener('keydown', submitForm);
        }
    }, [loginButton]);

    return <div className={styles.login}>
        <h2>
            Login
        </h2>
        <form onSubmit={e => e.preventDefault()}>
            <input id='username' name='username' placeholder='username' type='text' autoFocus/>

            <input id='password' name='password' placeholder='password' type='password'/>
            
            <button ref={loginButton} formAction={_login}>Login</button>
            <button formAction={_register}>Register</button>
            <div>
                {isError(loginState) && loginState.error}<br/>
                {isError(registerState) && registerState.error}
            </div>
        </form>
    </div>;
}