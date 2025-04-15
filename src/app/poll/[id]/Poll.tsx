'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import { SerializedFullPoll } from "@/actions/polls/types";
import { RankValueType, setVoteRanks } from "@/actions/polls/votes";
import { updatePoll, UpdatePollProps } from "@/actions/polls/polls";
import { addOption } from "@/actions/polls/options";

import { MyError } from "@/lib/myerror";

import RankedPollOption from "./PollOptionRanked";
import PollOption from "./PollOption";

import styles from './poll.module.css';

interface PollProps {
    poll: SerializedFullPoll;
}
export default function Poll({ poll: _poll }: PollProps) {
    const router = useRouter();
    const [poll, setPoll] = useState(_poll);
    const [newOptionText, setNewOptionText] = useState('');
    const [changedValues, setChangedValues] = useState<RankValueType[]>([]);

    const _inactivatePoll = async() => {
        const res = await updatePoll(poll.uuid, {active: false});
        if(res) router.replace('/poll');
    }

    const _updatePoll = async(updateProps: UpdatePollProps) => {
        const res = await updatePoll(poll.uuid, updateProps);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            setPoll(res);
        }
    }

    const _addOption = async() => {
        if(!newOptionText) {
            toast.warning('Type it first');
            return;
        }
        const res = await addOption(poll.uuid, newOptionText);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            setNewOptionText('');
            setPoll(res);
        }
    }

    const _setChangedValues = (rv: RankValueType) => {
        setChangedValues(cv => {
            return cv.concat([rv]);
        });
    }

    const sendRankedVote = async () => {
        const res = await setVoteRanks(poll.uuid, changedValues);
        if(MyError.isInstanceOf(res)) {
            toast.error(res.message);
        } else {
            setChangedValues([]);
            setPoll(res);
        }
    }

    const mine = poll.yours;

    return <>
        <Link href='/poll'>Back</Link>
        <div className={styles.pollHeader}>
            <h2>
                {mine && 
                    <input type='text' 
                        defaultValue={poll.title} 
                        onBlur={() => _updatePoll({title: poll.title})}/>
                    || poll.title
                }
            </h2>
            <h4>
                {poll.dateCreated}
            </h4>
            {mine && <input type='button' 
                value='Delete' 
                onClick={() => _inactivatePoll()}/> || <></>
            }
        </div>
        {mine && <span>
            <label htmlFor='addableBox'>Allow guests to add options</label>
            <input id='addableBox'
                type='checkbox' 
                defaultChecked={poll.guestAddable} 
                onChange={e => _updatePoll({guestAddable: e.target.checked})}/>
            </span> || <></>
        }
        <br/>
        {mine && <span>
            <label htmlFor='rankedBox'>Ranked Choice</label>
            <input id='rankedBox'
                type='checkbox' 
                defaultChecked={poll.rankedChoice} 
                onChange={e => _updatePoll({rankedChoice: e.target.checked})}/>
            </span> || <></>
        }
        <br/>
        <br/>
        {
            (mine || poll.guestAddable) && <>
                <input type='text' 
                    placeholder='New Option' 
                    value={newOptionText}
                    onChange={e => setNewOptionText(e.target.value)}/>
                <input type='button' value='Add option' onClick={() => _addOption()}/>
            </>
        }
        <br/>
        <br/>
        {poll.rankedChoice && changedValues.length &&
            <input type='button'
                onClick={() => sendRankedVote()}
                value='Send Vote'/>
            || <></>
        }
        <div className={styles.pollOptions}>
            {
                poll.options.map((p)=> {
                    return poll.rankedChoice ? 
                        <RankedPollOption 
                            key={p.id} 
                            option={p} 
                            uuid={poll.uuid} 
                            onPollChange={p => setPoll(p)}
                            emptyChanges={changedValues.length===0}
                            onChange={_setChangedValues}
                            options={poll.options}
                            myPoll={mine}/> 
                            :
                        <PollOption 
                            key={p.id} 
                            option={p} 
                            onPollChange={p => setPoll(p)}
                            uuid={poll.uuid} 
                            myPoll={mine}/>;
                }) || <></>
            }
        </div>
    </>
}