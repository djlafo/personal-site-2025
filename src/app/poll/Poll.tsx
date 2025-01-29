import { useEffect, useState } from "react";

import { readPoll, SerializedFullPoll, SerializedPoll, SerializedPollOption, voteFor } from "@/actions/polls"

interface PollProps {
    poll: SerializedPoll
}
export default function Poll(props: PollProps) {
    const [fullPoll, setFullPoll] = useState<SerializedFullPoll>();

    useEffect(() => {
        readPoll(props.poll.uuid).then(p => {
            setFullPoll(p);
        });
    }, [props.poll]);

    const vote = async (p: SerializedPollOption) => {
        const v = await voteFor(p.id);
    }

    return <>
        <h2>
            {props.poll.title} - {props.poll.dateCreated}
        </h2>
        {
            fullPoll && fullPoll.options.map(p => {
                return <div key={p.id}>
                    {p.text} - {p.votes} votes - <input type='button' value='Vote' onClick={() => vote(p)}/>
                </div>;
            }) || <></>
        }
    </>
}