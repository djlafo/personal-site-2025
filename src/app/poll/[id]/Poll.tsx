'use client'
import { SerializedFullPoll, SerializedPollOption, voteFor } from "@/actions/polls"
import Link from "next/link";


interface PollProps {
    poll: SerializedFullPoll
}
export default function Poll(props: PollProps) {
    const vote = async (p: SerializedPollOption) => {
        const v = await voteFor(p.id);
    }

    return <>
        <Link href='/poll'>Back</Link>
        <h2>
            {props.poll.title} - {props.poll.dateCreated}
        </h2>
        {
            props.poll.options.map(p => {
                return <div key={p.id}>
                    {p.text} - {p.votes} votes - <input type='button' value='Vote' onClick={() => vote(p)}/>
                </div>;
            }) || <></>
        }
    </>
}