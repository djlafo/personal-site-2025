import { Suspense } from "react";
import { Metadata } from "next";
import { listPolls } from "@/actions/polls/polls";
import { SerializedPoll } from "@/actions/polls/types";

import { PollButton, CreateButton } from './PollButtons';

import styles from './polllist.module.css';
import { LoadingScreenFallBack } from "@/components/LoadingScreen";

export const metadata: Metadata = {
    title: "Polls"
};
  

export default function Page() {
    return <div className={styles.pollListContainer}>
        <Suspense fallback={<LoadingScreenFallBack/>}>
            <PollList/>
        </Suspense>
    </div>;
}

async function PollList() {
    const polls = await listPolls();
    return <div>
        <CreateButton/>
        <div className={styles.pollList}>
            {
                polls && polls.map(p => {
                    return <PollListCard key={p.uuid} poll={p}/>;
                }) || <></>
            }
        </div>
    </div>;
}

function PollListCard(props: {poll: SerializedPoll}) {
    const poll = props.poll;

    return <div key={poll.uuid} className={styles.pollListCard}>
        <PollButton uuid={poll.uuid} title={poll.title}/>
        <br/>
        <span>{poll.dateCreated}</span>
    </div>;
}