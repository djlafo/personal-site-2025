import { ResolvingMetadata } from "next";
import { readPoll } from "@/actions/polls/polls"
import Poll from './Poll';
import { Suspense } from "react";

import styles from './poll.module.css';
import { LoadingScreenFallBack } from "@/components/LoadingScreen";
import { MyError } from "@/lib/myerror";

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata) {
    const par = await params;
    const fullPoll = await readPoll(par.id);

    if(fullPoll instanceof MyError) {
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
    params : Promise<{ id: string}>
}
export default function Page(props: PageProps) {
    return <div className={styles.poll}>
        <Suspense fallback={<LoadingScreenFallBack/>}>
            <PollLoader params={props.params}/>
        </Suspense>
    </div>;
}

async function PollLoader(props: PageProps) {
    const params = await props.params;
    const fullPoll = await readPoll(params.id);
    if(fullPoll instanceof MyError) {
        return <div>
            {fullPoll.message}
        </div>;
    } else {
        return <Poll poll={fullPoll}/>
    }
}