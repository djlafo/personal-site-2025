'use client'

import { useUser } from '@/components/Session';
import styles from './account.module.css';
import { updateAccount } from '@/actions/auth';
import { MyError } from '@/lib/myerror';
import { toast } from 'react-toastify';

export default function Page() {
    const [user, setUser] = useUser();

    const _updateAccount = async (fd: FormData) => {
        const resp = await updateAccount({phoneNumber: fd.get('phonenumber')?.toString()});
        if(MyError.isInstanceOf(resp)) { 
            toast.error(resp.message);
        } else {
            setUser(resp);
            toast.success('Saved!');
        }
    }

    return <div className={styles.account}>
        <form action={_updateAccount}>
            <label htmlFor="phonenumber">Phone(10 digits):</label>
            <input id="phonenumber"
                name='phonenumber' 
                type='tel' 
                defaultValue={user?.phone}
                pattern="[0-9]{10}"
                placeholder='5551239876'
                required/>
            <input type='submit' value="Submit"/>
        </form>
    </div>;
}