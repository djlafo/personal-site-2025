'use client'

import Link from "next/link";
import { useUser } from "@/components/Session";

interface PollButtonOptions {
    uuid: string;
    title: string;
}
export function PollButton(props: PollButtonOptions) {
    return <Link href={`/poll/${props.uuid}`}>{props.title}</Link>;
}

export function CreateButton() {
    const [user] = useUser();
    if(user) {
        return <Link href='/poll/create'>Create</Link>
    }
}