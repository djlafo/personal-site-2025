import { listPolls, SerializedPoll } from "@/actions/polls";
import { useEffect, useState } from "react";

interface PollListProps {
    onOpen: (p: SerializedPoll) => void;
}
export default function PollList(props: PollListProps) {
    const [polls, setPolls] = useState<Array<SerializedPoll>>();

    useEffect(() => {
        listPolls().then(p => {
            setPolls(p);
        });
    }, []);
    return <div>
        {
            polls && polls.map(p => {
                return <div key={p.uuid}>
                    {p.title} - {p.dateCreated} - <input type='button' value='Go' onClick={() => props.onOpen(p)}/>
                </div>;
            }) || <></>
        }
    </div>;
}