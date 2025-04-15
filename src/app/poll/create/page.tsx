'use client'

import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

import { addPoll } from '@/actions/polls/polls';
import { MyError } from '@/lib/myerror';

import styles from './pollcreate.module.css';

export default function Page() {

    const _addPoll = (f: FormData) => {
        addPoll(f).then(u => {
            if(MyError.isInstanceOf(u)) {
                toast.error(u.message);
            } else {
                redirect(`/poll/${u}`);
            }
        });
    }

    return <div className={styles.pollcreate}>
        <input type='button' value='Back' onClick={() => redirect('/poll')}/>
        <h2>
            Create Poll
        </h2>
        <form action={_addPoll}>
            <div className={styles.form}>
                <span>
                    <input required id='title' name='title' type='text' placeholder='Title'/>
                </span>
                <input type='submit' value='Publish'/>
            </div>
        </form>
    </div>;
}