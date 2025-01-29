import { readPoll } from "@/actions/polls"
import Poll from './Poll';
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Poll"
};

interface PageProps {
    params : Promise<{ id: string}>
}
export default function Page(props: PageProps) {
    return <Suspense fallback='Loading poll...'>
        <PollLoader params={props.params}/>
    </Suspense>;
}

async function PollLoader(props: PageProps) {
    const params = await props.params;
    const fullPoll = await readPoll(params.id);
    return <Poll poll={fullPoll}/>
}