'use client'

import { useState } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

import { addOption, inactivatePoll, SerializedFullPoll, SerializedPollOption, updateOption, voteFor } from "@/actions/polls"

interface PollProps {
    poll: SerializedFullPoll
}
export default function Poll(props: PollProps) {
    const [newOptionText, setNewOptionText] = useState('');
    const pathname = usePathname();

    const vote = async (p: SerializedPollOption) => {
        const v = await voteFor(p.id);
        if(v) redirect(pathname); // for now i will reload the page every action to stay semi up to date
    }

    const _inactivatePoll = async(uuid: string) => {
        const res = await inactivatePoll(uuid);
        if(res) redirect('/poll');
    }

    const _addOption = async() => {
        if(!newOptionText) {
            alert('Type it first');
            return;
        }
        const res = await addOption(props.poll.uuid, newOptionText);
        if(res) redirect(pathname);
    }

    const deleteOption = async(optionId: number, text: string) => {
        const res = await updateOption(props.poll.uuid, optionId, text, false);
        if(res) redirect(pathname);
    }

    const _updateOption = async(optionId: number, text: string) => {
        updateOption(props.poll.uuid, optionId, text, true); //don't bother refreshing here
    }

    const mine = props.poll.yours;

    return <>
        <Link href='/poll'>Back</Link>
        <h2>
            {props.poll.title} - {props.poll.dateCreated} {mine && <>- <input type='button' value='Delete' onClick={() => _inactivatePoll(props.poll.uuid)}/></> || <></>}
        </h2>
        {
            props.poll.options.map(p => {
                const myVote = (p.votes.find(v => v.yours));
                return <div key={p.id}>
                    {mine && <input type='text' defaultValue={p.text} onBlur={e => _updateOption(p.id, e.target.value)}/> || p.text}
                    &nbsp;- {p.votes.length} votes -&nbsp;
                    {!myVote && <input type='button' value='Vote' onClick={() => vote(p)}/> || 'Voted!'}
                    {mine && <input type='button' value='Delete' onClick={() => deleteOption(p.id, p.text)}/> || <></>}
                </div>;
            }) || <></>
        }
        {
            (mine || props.poll.guestAddable) && <>
                <input type='text' 
                    placeholder='New Option' 
                    value={newOptionText}
                    onChange={e => setNewOptionText(e.target.value)}/>
                <input type='button' value='Add option' onClick={() => _addOption()}/>
            </>
        }
    </>
}