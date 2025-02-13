import { updateOption } from "@/actions/polls/options";
import { SerializedFullPoll, SerializedPollOption } from "@/actions/polls/types";
import { RankValueType } from "@/actions/polls/votes";
import { MyError } from "@/lib/myerror";
import { useState } from "react";
import { toast } from "react-toastify";

import styles from './poll.module.css';

export interface RankedPollOptionProps {
    option: SerializedPollOption;
    uuid: string;
    myPoll: boolean;
    options: Array<SerializedPollOption>;
    onChange: (rv: RankValueType) => void;
    onPollChange: (p: SerializedFullPoll) => void;
    emptyChanges: boolean;
}
export default function RankedPollOption(props: RankedPollOptionProps) {
    const propRank = (() => {
        const r = props.option.votes.find(v => v.yours)?.rank;
        if(!r && r !== 0) {
            return props.options.length;
        }
        return r+1;
    })();
    const [rank, setRank] = useState<number>(propRank);
    
    if(props.emptyChanges && rank!==propRank) {
        setRank(propRank);
    }

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

    const getOptionRanks = () => {
        return props.options.map((o,i) => {
            return {
                index: i+1,
                id: o.id  
            };
        });
    }
    const changeVoteOrder = async (position: string) => {
        if(!position) return;
        const toNum = Number(position) - 1;
        setRank(toNum + 1);
        props.onChange({
            rank: toNum,
            pollOptionId: props.option.id
        });
    }

    const getAverage = () => {
        if(props.option.votes.length === 0) return 0;
        const ranks = props.option.votes.map(v => (v.rank || v.rank === 0) ? props.options.length + 1 - (v.rank + 1) : 0 );
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
        <select value={rank} onChange={e => changeVoteOrder(e.target.value)}>
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
