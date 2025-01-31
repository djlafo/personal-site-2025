'use client'
import { useState } from "react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import { ToastContainer } from 'react-toastify';

import { addOption, SerializedFullPoll, SerializedPollOption, setVoteRank, updateOption, updatePoll, UpdatePollProps, voteFor } from "@/actions/polls";

import styles from './poll.module.css';
import { toast } from "react-toastify";

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

    const _updatePoll = async(updateProps: UpdatePollProps) => {
        const res = await updatePoll(props.poll.uuid, updateProps);
        if(res) {
            redirect(pathname);
        } else {
            toast('Update failed');
        }
    }

    const _addOption = async() => {
        if(!newOptionText) {
            toast('Type it first');
            return;
        }
        const res = await addOption(props.poll.uuid, newOptionText);
        if(res) {
            redirect(pathname);
        } else {
            toast('Add failed. You may have reached the option limit');
        }
    }

    const mine = props.poll.yours;

    return <>
        <ToastContainer/>
        <Link href='/poll'>Back</Link>
        <div className={styles.pollHeader}>
            <h2>
                {mine && 
                    <input type='text' 
                        defaultValue={props.poll.title} 
                        onBlur={e => _updatePoll({title: props.poll.title})}/>
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
                onChange={e => _updatePoll({guestAddable: e.target.checked})}/>
            </span> || <></>
        }
        <br/>
        {mine && <span>
            <label htmlFor=''>Ranked Choice</label>
            <input type='checkbox' 
                defaultChecked={props.poll.rankedChoice} 
                onChange={e => _updatePoll({rankedChoice: e.target.checked})}/>
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
                props.poll.options.map((p,i)=> {
                    return props.poll.rankedChoice ? 
                        <RankedPollOption 
                            key={p.id} 
                            option={p} 
                            uuid={props.poll.uuid} 
                            options={props.poll.options}
                            myPoll={mine}/> 
                            :
                        <PollOption 
                            key={p.id} 
                            option={p} 
                            uuid={props.poll.uuid} 
                            myPoll={mine}/>;
                }) || <></>
            }
        </div>
    </>
}

interface RankedPollOptionProps {
    option: SerializedPollOption;
    uuid: string;
    myPoll: boolean;
    options: Array<SerializedPollOption>;
}
function RankedPollOption(props: RankedPollOptionProps) {
    const pathname = usePathname();

    const deleteOption = async(optionId: number, text: string) => {
        const res = await updateOption(props.uuid, optionId, text, false);
        if(res) {
            redirect(pathname);
        } else {
            toast('Delete failed');
        }
    }

    const _updateOption = async(optionId: number, text: string) => {
        updateOption(props.uuid, optionId, text, true); //don't bother refreshing here
    }

    const getOptionRanks = () => {
        return props.options.map((o,i) => {
            return {
                index: i+1,
                id: o.id  
            };
        });
    }

    const myRank = () => {
        const rank = props.option.votes.find(v => v.yours)?.rank;
        if(!rank && rank !== 0) {
            return;
        }
        return rank+1;
    }

    const changeVoteOrder = async (position: string) => {
        if(!position) return;
        const res = await setVoteRank(props.uuid, props.option.id, Number(position)-1);
        if(res) {
            redirect(pathname);
        } else {
            toast('Update failed');
        }
    }

    const getAverage = () => {
        if(props.option.votes.length === 0) return 0;
        const ranks = props.option.votes.map(v => v.rank ? v.rank + 1 : 0 );
        const total = ranks.reduce((acc, current) => {
            return acc + current;
        }, 0) 
        
        return total / props.option.votes.length;
    }

    return <div className={styles.rankedPollOption}>
        {props.myPoll && 
            <input type='text' 
                defaultValue={props.option.text} 
                onBlur={e => _updateOption(props.option.id, e.target.value)}/> 
            || <span>{props.option.text}</span>
        }
        <br/>
        <select value={myRank()} onChange={e => changeVoteOrder(e.target.value)}>
            {
                getOptionRanks().map(o => <option key={o.id} value={o.index}>{o.index}</option>)
            }
        </select>
        <br/>
        <span> 
            {getAverage()} score
        </span>
        <br/>
        {props.myPoll && 
            <input type='button' 
                value='Delete' 
                onClick={() => deleteOption(props.option.id, props.option.text)}/> 
            || <></>
        }
    </div>;
}

interface PollOptionProps {
    option: SerializedPollOption;
    uuid: string;
    myPoll: boolean;
}
function PollOption(props: PollOptionProps) {
    const myVote = !!(props.option.votes.find(v => v.yours));
    const pathname = usePathname();

    const deleteOption = async(optionId: number, text: string) => {
        const res = await updateOption(props.uuid, optionId, text, false);
        if(res) {
            redirect(pathname);
        } else {
            toast('Delete failed');
        }
    }

    const _updateOption = async(optionId: number, text: string) => {
        updateOption(props.uuid, optionId, text, true); //don't bother refreshing here
    }

    const vote = async (p: SerializedPollOption) => {
        const v = await voteFor(p.id);
        if(v) {
            redirect(pathname); // for now i will reload the page every action to stay semi up to date
        } else {
            toast('Vote failed');
        }
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
            disabled={myVote}
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