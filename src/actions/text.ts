'use server'

import { MyError, MyErrorObj } from '@/lib/myerror';
import { getUser } from '@/lib/sessions';
import { sendText as _sendText } from '@/lib/twilio';

export async function sendText(message: string, number: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user || user.username !== 'dylan') return MyError.create({message: 'No! Go Away!'});

    await _sendText(message, number);

    return true;
}