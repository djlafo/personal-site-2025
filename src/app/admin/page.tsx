'use client'

import { sendText } from "@/actions/text";
import { setupTextAlert } from "@/actions/wss";
import TimeInput from "@/components/TimeInput";
import { MyError } from "@/lib/myerror";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Page() {
    const [time, setTime] = useState<number>(0);

    const _sendText = async (f: FormData) => {
        const messageContent = f.get('messagecontent')?.toString();
        const number = f.get(`number`)?.toString();
        if(!messageContent || !number) {
            return;
        }
        const resp = await sendText(messageContent, number);
        if(MyError.isInstanceOf(resp)) toast.error(resp.message);
    }

    const _setAlert = async (f: FormData) => {
        const messageContent = f.get('messagecontent')?.toString();
        if(!messageContent) return;
        const resp = await setupTextAlert(time, messageContent);
        if(MyError.isInstanceOf(resp)) {
            toast.error(resp.message);
        } else {
            toast.success('Created');
        }
    }

    return <div>
        <form action={_sendText}>
            Message: <input name='messagecontent' type='text' required/>
            Number(10 digits): <input name='number' type='text' required/>
            <input type='submit' value='Send'/>
        </form>
        <br/>
        <br/>
        <br/>
        <form action={_setAlert}>
            Message: <input name='messagecontent' type='text' required/>
            Time: <TimeInput name='time' value={time} onValueChange={t => setTime(t)}required/>
            <input type='submit' value='Submit'/>
        </form>       
    </div>
}