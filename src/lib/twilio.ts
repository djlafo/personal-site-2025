import { TextMessage } from '@/actions/text';
import db from '@/db';
import { plannerTable } from '@/db/schema/planner';
import { plannerRowTable } from '@/db/schema/plannerrow';
import { usersTable } from '@/db/schema/users';
import { eq, and } from 'drizzle-orm';
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

export async function listTexts() {
    const alerts = await db.select().from(plannerRowTable)
            .innerJoin(plannerTable, eq(plannerTable.id, plannerRowTable.plannerId))
            .innerJoin(usersTable, eq(usersTable.plannerId, plannerTable.id))
            .where(and(
                eq(plannerRowTable.text, true),
                eq(plannerRowTable.done, false)
            ));
    
    const texts: TextMessage[] = [];
    
    alerts.forEach(a => {
        if(!a.planner_row.deadline) return;
        if(!a.users.phoneNumber) return;
        texts.push({
            id: a.planner_row.id,
            time: new Date(a.planner_row.deadline).getTime(),
            text: a.planner_row.label,
            recipient: a.users.phoneNumber
        });
    });

    return texts;
}