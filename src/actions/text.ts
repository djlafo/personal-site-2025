'use server'

import { MyError, MyErrorObj } from '@/lib/myerror';
import { getUser } from '@/lib/sessions';
import twilio from 'twilio';

if(!process.env.TWILIO_ACCOUNT_SID || 
    !process.env.TWILIO_AUTH_TOKEN || 
    !process.env.TWILIO_NUMBER) throw new Error('MISSING TWILIO ENV');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendText(message: string, number: string): Promise<boolean | MyErrorObj> {
    const user = await getUser();
    if(!user || user.username !== 'dylan') return MyError.create({message: 'No! Go Away!'});

    const messageReq = await client.messages.create({
        body: message,
        from: process.env.TWILIO_NUMBER,
        to: `+1${number}`
    })

    return true;
}