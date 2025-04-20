'use client'

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
                    <input type='button' 
                        value='Logout'
                        onClick={() => _logout()}/>
            ) 
            ||
            (!pending && !user && 
                <Link className='button-style' href={`/login?redirect=${pathname}`}>Login</Link>)
        }
    </div>
}