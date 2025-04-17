'use client'

import { useUser } from '@/components/Session';
import styles from './account.module.css';
import { updateAccount } from '@/actions/auth';
import { MyError } from '@/lib/myerror';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { deleteTextAlert, listTextAlerts, setupTextAlert, TextEventData } from '@/actions/wss';
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
            await _listAlerts(false);
            toast.success('Created');
        }
    }

    const _deleteAlert = async (ted: TextEventData) => {
        const resp = await deleteTextAlert(ted.time, ted.text)
        if(MyError.isInstanceOf(resp)) {
            toast.error(resp.message);
        } else {
            await _listAlerts(false);
            toast.success('Deleted');
        }
    }

    const _listAlerts = async (showToast = true) => {
        const resp = await listTextAlerts();
        if(MyError.isInstanceOf(resp)) {
            toast.error(resp.message);
        } else {
            setEventData(resp);
            if(showToast) toast.success('Loaded alerts');
        }
    }

    useEffect(() => {
        _listAlerts(false);
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
                eventData && eventData.sort((b, a) => b.time - a.time).map(ed => {
                    const d = new Date(ed.time);
                    return <div key={`${ed.time}-${ed.text}`}>
                        {d.toLocaleDateString('en-US')} {d.toLocaleTimeString('en-US')}: &quot;{ed.text}&quot;&nbsp;
                        <button onClick={() => _deleteAlert(ed)}>Delete</button>
                    </div>;
                })
            }
        </div>
    </div>;
}