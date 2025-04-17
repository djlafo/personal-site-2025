import 'server-only';

import twilio from 'twilio';

if(!process.env.TWILIO_ACCOUNT_SID || 
    !process.env.TWILIO_AUTH_TOKEN || 
    !process.env.TWILIO_NUMBER) throw new Error('MISSING TWILIO ENV');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendText(message: string, number: string) {
    await client.messages.create({
        body: message,
        from: process.env.TWILIO_NUMBER,
        to: `+1${number}`
    });
}