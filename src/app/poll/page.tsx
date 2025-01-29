import { listPolls, SerializedPoll } from "@/actions/polls";
import { Metadata } from "next";

import PollButton from './PollButton';
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Polls"
};

export default function Page() {
    return <Suspense fallback='Loading polls...'>
        <PollList/>
    </Suspense>
}

async function PollList() {
    const polls = await listPolls();
    return <div>
        {
            polls && polls.map(p => {
                return <div key={p.uuid}>
                    {p.title} - {p.dateCreated} - <PollButton uuid={p.uuid}/>
                </div>;
            }) || <></>
        }
    </div>;
}