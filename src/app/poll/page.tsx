import { Suspense } from "react";
import { Metadata } from "next";

import { listPolls } from "@/actions/polls";

import PollButton from './PollButton';

import styles from './polllist.module.css';

export const metadata: Metadata = {
    title: "Polls"
};

export default function Page() {
    return <div className={styles.polllist}>
        <Suspense fallback='Loading polls...'>
            <PollList/>
        </Suspense>
    </div>;
}

async function PollList() {
    const polls = await listPolls();
    return <div>
        This section is WIP!
        {
            polls && polls.map(p => {
                return <div key={p.uuid}>
                    {p.title} - {p.dateCreated} - <PollButton uuid={p.uuid}/>
                </div>;
            }) || <></>
        }
    </div>;
}