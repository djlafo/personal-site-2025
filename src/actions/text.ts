'use server'

import { MyError, MyErrorObj } from '@/lib/myerror';
import { getUser } from '@/lib/sessions';
import { sendText as _sendText, listTexts } from '@/lib/twilio';

export interface TextEventData {
    action: 'add' | 'remove' | 'list';
    texts: TextMessage[];
}

export interface TextMessage { 
    time: number;
    text: string;
    recipient: string;
    id: number;
}

export async function sendText(message: string, number: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user || user.username !== 'dylan') return MyError.create({message: 'No! Go Away!'});

    await _sendText(message, number);

    return true;
}

export async function listUserTexts() {
    const user = await getUser(true);
    const texts = await listTexts();
    return texts.filter(t => t.recipient === user?.phoneNumber && new Date(t.time) > new Date());
}