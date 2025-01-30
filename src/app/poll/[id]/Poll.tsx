'use client'

import { useState } from "react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";

import { addOption, SerializedFullPoll, SerializedPollOption, updateOption, updatePoll, voteFor } from "@/actions/polls";

import styles from './poll.module.css';

interface PollProps {
    poll: SerializedFullPoll
}
export default function Poll(props: PollProps) {
    const router = useRouter();
    const [newOptionText, setNewOptionText] = useState('');
    const pathname = usePathname();

    const _inactivatePoll = async() => {
        const res = await updatePoll(props.poll.uuid, {active: false});
        if(res) router.push('/poll');
    }

    const _updatePoll = async(title: string, guestAddable: boolean) => {
        const res = await updatePoll(props.poll.uuid, {title: title, guestAddable: guestAddable});
        if(!res) alert('Update failed');
    }

    const _addOption = async() => {
        if(!newOptionText) {
            alert('Type it first');
            return;
        }
        const res = await addOption(props.poll.uuid, newOptionText);
        if(res) {
            redirect(pathname);
        } else {
            alert('Add failed. You may have reached the option limit');
        }
    }

    const mine = props.poll.yours;

    return <>
        <Link href='/poll'>Back</Link>
        <div className={styles.pollHeader}>
            <h2>
                {mine && 
                    <input type='text' 
                        defaultValue={props.poll.title} 
                        onBlur={e => _updatePoll(e.target.value, props.poll.guestAddable)}/>
                    || props.poll.title
                }
            </h2>
            <h4>
                {props.poll.dateCreated}
            </h4>
            {mine && <input type='button' 
                value='Delete' 
                onClick={() => _inactivatePoll()}/> || <></>
            }
        </div>
        {mine && <span>
            <label htmlFor=''>Allow guests to add options</label>
            <input type='checkbox' 
                defaultChecked={props.poll.guestAddable} 
                onChange={e => _updatePoll(props.poll.title, e.target.checked)}/>
            </span> || <></>
        }
        <br/>
        <br/>
        {
            (mine || props.poll.guestAddable) && <>
                <input type='text' 
                    placeholder='New Option' 
                    value={newOptionText}
                    onChange={e => setNewOptionText(e.target.value)}/>
                <input type='button' value='Add option' onClick={() => _addOption()}/>
            </>
        }
        <div className={styles.pollOptions}>
            {
                props.poll.options.map(p => {
                    const myVote = !!(p.votes.find(v => v.yours));
                    return <PollOption key={p.id} option={p} uuid={props.poll.uuid} myPoll={mine} myVote={myVote}/>;
                }) || <></>
            }
        </div>
    </>
}

interface PollOptionProps {
    option: SerializedPollOption;
    uuid: string;
    myPoll: boolean;
    myVote: boolean;
}
function PollOption(props: PollOptionProps) {
    const pathname = usePathname();

    const deleteOption = async(optionId: number, text: string) => {
        const res = await updateOption(props.uuid, optionId, text, false);
        if(res) redirect(pathname);
    }

    const _updateOption = async(optionId: number, text: string) => {
        updateOption(props.uuid, optionId, text, true); //don't bother refreshing here
    }

    const vote = async (p: SerializedPollOption) => {
        const v = await voteFor(p.id);
        if(v) redirect(pathname); // for now i will reload the page every action to stay semi up to date
    }

    return <div className={styles.pollOption}>
        {props.myPoll && 
            <input type='text' 
                defaultValue={props.option.text} 
                onBlur={e => _updateOption(props.option.id, e.target.value)}/> 
            || <span>{props.option.text}</span>
        }
        <br/>
        <input type='button' 
            value='Vote' 
            disabled={props.myVote}
            onClick={() => vote(props.option)}/>
        <br/>
        <span> 
            {props.option.votes.length} votes
        </span>
        <br/>
        {props.myPoll && 
            <input type='button' 
                value='Delete' 
                onClick={() => deleteOption(props.option.id, props.option.text)}/> 
            || <></>
        }
    </div>
}