'use client'

import { sendText } from "@/actions/text";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";

export default function Page() {
    const _sendText = async (f: FormData) => {
        const messageContent = f.get('messagecontent')?.toString();
        const number = f.get(`number`)?.toString();
        if(!messageContent || !number) {
            toast.info('Content is empty');
            return;
        }
        const resp = await sendText(messageContent, number);
        if(MyError.isInstanceOf(resp)) toast.error(resp.message);
    }

    return <div>
        <form action={_sendText}>
            Message: <input name='messagecontent' type='text'/>
            Number(10 digits): <input name='number' type='text'/>
            <input type='submit' value='Send'/>
        </form>
    </div>
}