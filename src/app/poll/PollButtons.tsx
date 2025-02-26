'use client'

import { useUser } from "@/components/Session";
import { useRouter } from "next/navigation";

interface PollButtonOptions {
    uuid: string;
    title: string;
}
export function PollButton(props: PollButtonOptions) {
    const router = useRouter();
    return <input type='button' onClick={() => router.push(`/poll/${props.uuid}`)} value={props.title}/>;
}

export function CreateButton() {
    const [user] = useUser();
    const router = useRouter();
    if(user) {
        return <input type='button' value='Create' onClick={() => router.push('/poll/create')}/>
    }
}