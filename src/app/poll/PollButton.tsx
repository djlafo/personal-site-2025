'use client'
import { SerializedPoll } from "@/actions/polls";
import { redirect } from "next/navigation";

interface PollButtonOptions {
    uuid: string
}
export default function PollButton(props: PollButtonOptions) {
    return <input type='button' value='Go' onClick={() => redirect(`/poll/${props.uuid}`)}/>;
}