'use client'

import { useUser } from "@/components/Session";
import { redirect } from "next/navigation";

interface PollButtonOptions {
    uuid: string
}
export function PollButton(props: PollButtonOptions) {
    return <input type='button' value='Go' onClick={() => redirect(`/poll/${props.uuid}`)}/>;
}

export function CreateButton() {
    const [user] = useUser();
    if(user) {
        return <input type='button' value='Create' onClick={() => redirect('/poll/create')}/>
    }
}