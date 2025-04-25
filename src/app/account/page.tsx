'use client'

import { useUser } from '@/components/Session';
import styles from './account.module.css';
import { updateAccount } from '@/actions/auth';
import { MyError } from '@/lib/myerror';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { listUserTexts, TextMessage } from '@/actions/text';
// import TimeInput from '@/components/TimeInput';

export default function Page() {
    const [eventData, setEventData] = useState<TextMessage[]>();

    const _listAlerts = async (showToast = true) => {
        const resp = await listUserTexts();
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
        <AccountDetails/>
        {/* <br/>
        <br/>
        <TextAlerts onAlertsChanged={_listAlerts}/> */}
        <br/>
        <br/>
        {eventData && <AlertList alerts={eventData}/> || <></>}
    </div>;
}


function AccountDetails() {
    const [user, setUser] = useUser();

    const _updateAccount = async (fd: FormData) => {
        const resp = await updateAccount({
            phoneNumber: fd.get('phonenumber')?.toString(),
            zip: fd.get('zip')?.toString()
        });
        if(MyError.isInstanceOf(resp)) { 
            toast.error(resp.message);
        } else {
            setUser(resp);
            toast.success('Saved!');
        }
    }

    return <form action={_updateAccount}>
        <label htmlFor='phonenumber'>Phone(10 digits):</label>
        <input id='phonenumber'
            name='phonenumber' 
            type='tel' 
            defaultValue={user?.phone}
            pattern="[0-9]{10}"
            placeholder='5551239876'/>
        <label htmlFor='zip'>ZIP code(5 digits):</label>
        <input id='zip'
            name='zip'
            type='tel'
            defaultValue={user?.zip}
            pattern="[0-9]{5}"
            placeholder='12345'/>
        <input type='submit' value="Submit"/>
    </form>;
}

// interface TextAlertsProps {
//     onAlertsChanged: (showToast: boolean) => Promise<void>;
// }
// function TextAlerts({onAlertsChanged}: TextAlertsProps) {
//     const [time, setTime] = useState<number>(0);

//     const _setAlert = async (f: FormData) => {
//         const messageContent = f.get('messagecontent')?.toString();
//         if(!messageContent) return;
//         const resp = await setupTextAlert(time, messageContent);
//         if(MyError.isInstanceOf(resp)) {
//             toast.error(resp.message);
//         } else {
//             await onAlertsChanged(false);
//             toast.success('Created');
//         }
//     }

//     return <>
//         <h3>Set Text Alert</h3>
//         <form action={_setAlert}>
//             <label htmlFor='messagecontent'>Message</label>
//             <input id='messagecontent' 
//                 name='messagecontent' 
//                 type='text' 
//                 required/>
//             <label htmlFor='time'>Time</label>
//             <TimeInput name='time' 
//                 id='time'
//                 value={time} 
//                 onValueChange={t => setTime(t)}required/>
//             <input type='submit' value='Submit'/>
//         </form>
//     </>;
// }

interface AlertListProps {
    alerts: TextMessage[];
}
function AlertList({alerts}: AlertListProps) {

    return <>
        <h3>Alert List</h3>
        <div>
            {
                alerts && alerts.sort((b, a) => b.time - a.time).map(ed => {
                    const d = new Date(ed.time);
                    return <div key={`${ed.time}-${ed.text}`}>
                        {d.toLocaleDateString('en-US')} {d.toLocaleTimeString('en-US')}: &quot;{ed.text}&quot;&nbsp;
                    </div>;
                })
            }
        </div>
    </>;
}