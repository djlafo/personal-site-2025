'use client'

import { sendText } from "@/actions/text";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";

export default function Page() {
    const _sendText = async (f: FormData) => {
        const messageContent = f.get('messagecontent')?.toString();
        const number = f.get(`number`)?.toString();
        if(!messageContent || !number) {
            return;
        }
        const resp = await sendText(messageContent, number);
        if(MyError.isInstanceOf(resp)) toast.error(resp.message);
    }

    return <div>
        <form action={_sendText}>
            Message: <input name='messagecontent' type='text' required/>
            Number(10 digits): <input name='number' type='text' required/>
            <input type='submit' value='Send'/>
        </form>
    </div>
}