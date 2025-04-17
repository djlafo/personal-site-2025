'use client'

import { useUser } from '@/components/Session';
import styles from './account.module.css';
import { updateAccount } from '@/actions/auth';
import { MyError } from '@/lib/myerror';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { listTextAlerts, setupTextAlert, TextEventData } from '@/actions/wss';
import TimeInput from '@/components/TimeInput';

export default function Page() {
    const [user, setUser] = useUser();
    const [eventData, setEventData] = useState<TextEventData[]>();
    const [time, setTime] = useState<number>(0);

    const _updateAccount = async (fd: FormData) => {
        const resp = await updateAccount({phoneNumber: fd.get('phonenumber')?.toString()});
        if(MyError.isInstanceOf(resp)) { 
            toast.error(resp.message);
        } else {
            setUser(resp);
            toast.success('Saved!');
        }
    }

    const _setAlert = async (f: FormData) => {
        const messageContent = f.get('messagecontent')?.toString();
        if(!messageContent) return;
        const resp = await setupTextAlert(time, messageContent);
        if(MyError.isInstanceOf(resp)) {
            toast.error(resp.message);
        } else {
            toast.success('Created');
        }
    }

    const _deleteAlert = async () => {
        
        // 

        if(true) {
            toast.error('');
        } else {
            toast.success('deleted');
        }
    }

    useEffect(() => {
        listTextAlerts().then(resp => {
            if(MyError.isInstanceOf(resp)) {
                toast.error(resp.message);
            } else {
                setEventData(resp);
            }
        });
        // eslint-disable-next-line
    }, []);

    return <div className={styles.account}>
        <h3>Set Account Details</h3>
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
        <br/>
        <br/>
        <h3>Set Text Alert</h3>
        <form action={_setAlert}>
            <label htmlFor='messagecontent'>Message</label>
            <input id='messagecontent' 
                name='messagecontent' 
                type='text' 
                required/>
            <label htmlFor='time'>Time</label>
            <TimeInput name='time' 
                id='time'
                value={time} 
                onValueChange={t => setTime(t)}required/>
            <input type='submit' value='Submit'/>
        </form>
        <br/>
        <br/>
        <h3>Alert List</h3>
        <div>
            {
                eventData && eventData.map(ed => {
                    return <div>
                        {new Date(Date.now() + ed.time).toLocaleTimeString('en-US')}: "{ed.text}" 
                        <button onClick={() => _deleteAlert}>Delete</button>
                    </div>;
                })
            }
        </div>
    </div>;
}