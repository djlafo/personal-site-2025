import { Metadata, ResolvingMetadata } from "next";
import { readPoll } from "@/actions/polls"
import Poll from './Poll';
import { Suspense } from "react";

import styles from './poll.module.css';
import { LoadingScreenOnly } from "@/components/LoadingScreen";

interface MetaProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export async function generateMetadata({ params }: MetaProps, parent: ResolvingMetadata) {
    const par = await params;
    const fullPoll = await readPoll(par.id);
    return {
        title: fullPoll.title,
        description: 'A poll'
    }
}

interface PageProps {
    params : Promise<{ id: string}>
}
export default function Page(props: PageProps) {
    return <div className={styles.poll}>
        <Suspense fallback={<LoadingScreenOnly/>}>
            <PollLoader params={props.params}/>
        </Suspense>
    </div>;
}

async function PollLoader(props: PageProps) {
    const params = await props.params;
    const fullPoll = await readPoll(params.id);
    return <Poll poll={fullPoll}/>
}