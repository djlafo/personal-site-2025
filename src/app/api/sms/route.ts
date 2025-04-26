import { sendChat } from '@/actions/gpt';
import db from '@/db';
import { phoneVerificationTable } from '@/db/schema/phoneverification';
import { usersTable } from '@/db/schema/users';
import { eq, and } from 'drizzle-orm';
import twilio from 'twilio';

export async function POST(req: Request) {
    const fd = await req.formData();
    const body: any = {};
    fd.entries().forEach(v => {
        body[v[0]] = v[1];
    });
    const valid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN || '',
        req.headers.get('x-twilio-signature') || '',
        process.env.TWILIO_ENDPOINT || '',
        body
    )
    if(!valid) {
        console.log('Unauthorized text');
        return new Response('Unauthorized', {
            status: 401
        });
    }

    console.log(`Text received from ${fd.get('From')}: ${fd.get('Body')}`);

    const twiml = new twilio.twiml.MessagingResponse();
    // twiml.message(`Got it! Received: ${req.body.Body} from ${req.body.From}`);
    // const zip = fd.get('FromZip');
    // const state = fd.get('FromState');
    // const city = fd.get('FromCity');
    const message = fd.get('Body')?.toString();
    const wholeNumber = fd.get('From')?.toString();
    const number = wholeNumber?.substring(wholeNumber.length - 10);
    if(!message || !number) return new Response('', {status: 400});
    const parts = message.trim().toLowerCase().split(' ');
    if(parts[0] === 'yes' && parts.length === 2) {
        const id = parseInt(parts[1]);
        if(Number.isNaN(id)) {
            twiml.message('Invalid ID');
        } else {
            const ver = await db.select().from(phoneVerificationTable)
                .where(and(
                    eq(phoneVerificationTable.phoneNumber, number),
                    eq(phoneVerificationTable.verified, false),
                    eq(phoneVerificationTable.userId, id)
                ))

            if(ver.length) {
                await db.update(phoneVerificationTable).set({verified: true}).where(eq(phoneVerificationTable.id, ver[0].id));
                await db.update(usersTable).set({phoneNumber: number}).where(eq(usersTable.id, ver[0].userId));

                twiml.message(`Confirmed! Text \'remove ${ver[0].userId}\' anytime to remove this account, or \'remove\' to remove from all accounts.`);
            } else {
                twiml.message('Could not find verification request');
            }
        }
    } else if (parts[0] === 'remove' && (parts.length === 1 || parts.length === 2)) {
        if(parts.length === 2) {
            const id = parseInt(parts[1]);
            if(Number.isNaN(id)) {
                twiml.message('Invalid ID');
            } else {
                await db.update(usersTable).set({phoneNumber: null}).where(and(
                    eq(usersTable.phoneNumber, number),
                    eq(usersTable.id, id)
                ));
                await db.delete(phoneVerificationTable).where(and(
                    eq(phoneVerificationTable.phoneNumber, number),
                    eq(phoneVerificationTable.userId, id)
                ));
                twiml.message(`Removed from ${id}!`)
            }
        } else if (parts.length === 1) {
            await db.update(usersTable).set({phoneNumber: null}).where(eq(usersTable.phoneNumber, number));
            await db.delete(phoneVerificationTable).where(eq(phoneVerificationTable.phoneNumber, number));
            twiml.message('Removed from all!')
        }
    } else if (parts[0] === 'gpt') {
        const gptResponse = await sendChat(parts.slice(1).join(' '), []);
        twiml.message(gptResponse.text);
    } else {
        twiml.message('I didn\'t recognize this command');
    }

    return new Response(twiml.toString(), {status: 200, headers: {'Content-Type': 'text/xml'}});
}
