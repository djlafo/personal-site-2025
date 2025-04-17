'use server'

import { MyError, MyErrorObj } from "@/lib/myerror";
import { getUser } from "@/lib/sessions"
import { getWebSocket } from "@/lib/websocket";

export async function setupTextAlert(time: number, text: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not logged in'});
    try {
        const ws = await getWebSocket({token: process.env.AUTH_SECRET || '', user:false});
        const ev = {
            event: 'text',
            data: {
                time: time,
                text: text,
                recipient: user.phoneNumber
            }
        }
        ws.send(JSON.stringify(ev));
        ws.close();
        return true;
    } catch (e: any) {
        console.log(e.code || e)
        return MyError.create({message: e.code || e});
    }
}
