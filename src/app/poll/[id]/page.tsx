import { readPoll } from "@/actions/polls/polls"
import Poll from './Poll';
import { Suspense } from "react";

import styles from './poll.module.css';
import { LoadingScreenFallBack } from "@/components/LoadingScreen";
import { MyError } from "@/lib/myerror";

export async function generateMetadata({ params }: PageProps) { // , parent: ResolvingMetadata
    const par = await params;
    const fullPoll = await readPoll(par.id);

    if(MyError.isInstanceOf(fullPoll)) {
        return {
            title: fullPoll.message
        };
    } else {
        return {
            title: fullPoll.title,
            description: 'A poll'
        }
    }
}

interface PageProps {
    params: Promise<{ id: string}>;
}
export default function Page({ params }: PageProps) {
    return <div className={styles.poll}>
        <Suspense fallback={<LoadingScreenFallBack/>}>
            <PollLoader params={params}/>
        </Suspense>
    </div>;
}

async function PollLoader({ params }: PageProps) {
    const _params = await params;
    const fullPoll = await readPoll(_params.id);
    if(MyError.isInstanceOf(fullPoll)) {
        return <div>
            {fullPoll.message}
        </div>;
    } else {
        return <Poll poll={fullPoll}/>
    }
}