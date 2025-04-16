'use client'

import { sendText } from "@/actions/text";
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";

export default function Page() {
    const _sendText = async (f: FormData) => {
        const messageContent = f.get('messagecontent')?.toString();
        if(!messageContent) {
            toast.info('Content is empty');
            return;
        }
        const resp = await sendText(messageContent);
        if(MyError.isInstanceOf(resp)) toast.error(resp.message);
    }

    return <div>
        <form action={_sendText}>
            <input name='messagecontent' type='text'/>
            <input type='submit' value='Send'/>
        </form>
    </div>
}