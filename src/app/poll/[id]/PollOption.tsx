import { updateOption } from "@/actions/polls/options";
import { SerializedFullPoll, SerializedPollOption } from "@/actions/polls/types";
import { voteFor } from "@/actions/polls/votes";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";

import styles from './poll.module.css';

export interface PollOptionProps {
    option: SerializedPollOption;
    uuid: string;
    myPoll: boolean;
    onPollChange: (p: SerializedFullPoll) => void;
}
export default function PollOption(props: PollOptionProps) {
    const myVote = !!(props.option.votes.find(v => v.yours));

    const deleteOption = async(optionId: number, text: string) => {
        const res = await updateOption(props.uuid, optionId, text, false);
        if(res instanceof MyError) {
            toast(res.message);
        } else {
            props.onPollChange(res);
        }
    }

    const _updateOption = async(optionId: number, text: string) => {
        updateOption(props.uuid, optionId, text, true); //don't bother refreshing here
    }

    const vote = async (p: SerializedPollOption) => {
        const res = await voteFor(props.uuid, p.id);
        if(res instanceof MyError) {
            toast(res.message);
        } else {
            props.onPollChange(res);
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