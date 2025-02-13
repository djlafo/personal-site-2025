'use client'

import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

import { addPoll } from '@/actions/polls/polls';
import { MyError } from '@/lib/myerror';

import styles from './pollcreate.module.css';

export default function Page() {

    const _addPoll = (f: FormData) => {
        addPoll(f).then(u => {
            if(u instanceof MyError) {
                toast(u.message);
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



// export interface OptionsType {
    //     text: string;
    // }

// const [options, setOptions] = useState<Array<OptionsType>>([]);

    // const addOption = () => {
    //     setOptions(o => o.concat([{
    //         text: ''
    //     }]));
    // }

    // const updateOption = (text: string, ind: number) => {
    //     setOptions(o => {
    //         const dupe = o.slice();
    //         dupe.splice(ind, 1, {
    //             text: text
    //         });
    //         return dupe;
    //     });
    // }

    // const deleteOption = (ind: number) => {
    //     setOptions(o => {
    //         const dupe = o.slice();
    //         dupe.splice(ind, 1);
    //         return dupe;
    //     });
    // }


        /* <h3>Options</h3>
    {
        options.map((o,i) => {
            return <span key={i}>
                <input id={`option${i}`} 
                    name={`option${i}`} 
                    value={o.text}
                    onChange={e => updateOption(e.target.value, i)}
                    type='text' 
                    placeholder='Option'/>
                <input type='button'
                    value='x'
                    onClick={() => deleteOption(i)}/>
            </span>;
        })
    }
    <input type='button' value='Add Option' onClick={() => addOption()}/> */