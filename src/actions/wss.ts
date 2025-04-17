'use server'

import { MyError, MyErrorObj } from "@/lib/myerror";
import { getUser } from "@/lib/sessions"
import { getWebSocket } from "@/lib/websocket";
import { getServerWebSocket } from "@/lib/websocketserver";

export interface TextEventData {
    action: 'add' | 'remove' | 'list'
    time: number;
    text: string;
    recipient: string;
}

export async function setupTextAlert(time: number, text: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not logged in'});
    
    const ws = await getServerWebSocket();
    if(MyError.isInstanceOf(ws)) return ws;

    ws.send(JSON.stringify({
        event: 'text',
        data: {
            action: 'add',
            time: time,
            text: text,
            recipient: user.phoneNumber
        }
    }), err => {
        if(err) return MyError.create({message: err.message});
        return MyError.create({message: 'Unknown error sending event'});
    });
    ws.close();

    return true;
}

export async function listTextAlerts(): Promise<TextEventData[] | MyErrorObj> {
    const user = await getUser();
    if(!user) return MyError.create({message: 'Not logged in'});
    const ws = await getServerWebSocket();
    if(MyError.isInstanceOf(ws)) return ws;

    const p = new Promise<TextEventData[] | MyErrorObj>((acc) => {
        ws.on('message', data => {
            // get the response list
            acc(JSON.parse(data.toString()).data as TextEventData[]);
        });
        ws.send(JSON.stringify({
            event: 'text',
            data: {
                action: 'list',
                recipient: user.phoneNumber
            }
        }), err => {
            if(err) acc(MyError.create({message: err.message}));
            acc(MyError.create({message: 'Unknown error sending event'}));
        });
    });

    return await p;
}