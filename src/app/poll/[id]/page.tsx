import { readPoll } from "@/actions/polls"
import Poll from './Poll';
import { Suspense } from "react";
import { Metadata } from "next";

import styles from './poll.module.css';

export const metadata: Metadata = {
    title: "Poll"
};

interface PageProps {
    params : Promise<{ id: string}>
}
export default function Page(props: PageProps) {
    return <div className={styles.poll}>
        <Suspense fallback='Loading poll...'>
            <PollLoader params={props.params}/>
        </Suspense>
    </div>;
}

async function PollLoader(props: PageProps) {
    const params = await props.params;
    const fullPoll = await readPoll(params.id);
    return <Poll poll={fullPoll}/>
}