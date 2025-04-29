import { TextMessage } from '@/actions/text';
import { getNextDeadlineAndText } from '@/app/planner/helpers';
import db from '@/db';
import { plannerTable } from '@/db/schema/planner';
import { plannerRowTable } from '@/db/schema/plannerrow';
import { usersTable } from '@/db/schema/users';
import { eq, and, isNotNull, inArray } from 'drizzle-orm';
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

export async function listTexts(update = false) {
    const alerts = await db.select().from(plannerRowTable)
            .innerJoin(plannerTable, eq(plannerTable.id, plannerRowTable.plannerId))
            .innerJoin(usersTable, eq(usersTable.plannerId, plannerTable.id))
            .where(and(
                isNotNull(plannerRowTable.textAt),
                eq(plannerRowTable.done, false)
            ));
    
    const texts: TextMessage[] = [];
    
    alerts.forEach(a => {
        // TODO come back and assume a future or past textdate
        if(!a.users.phoneNumber) return;
        const nxt = getNextDeadlineAndText(a.planner_row);
        if(!nxt.textAt) return;
        texts.push({
            id: a.planner_row.id,
            time: nxt.textAt.getTime(),
            text: `Planner event "${a.planner_row.label}" ${a.planner_row.deadline ? `at ${new Date(a.planner_row.deadline).toLocaleString('en-US')}` : ''}`,
            recipient: a.users.phoneNumber
        });
    });

    if(update) {
        const overdue = alerts.filter(t => {
            if(!t.planner_row.textAt) return false;
            const textDate = new Date(t.planner_row.textAt);
            const currentDate = new Date();
            if(t.planner_row.lastText) {
                const lastDate = new Date(t.planner_row.lastText);
                if(t.planner_row.recurMonths && t.planner_row.recurDays) {
                    return false;
                } else if(t.planner_row.recurMonths) {
                    const textDate = new Date(t.planner_row.textAt);
                    const textNum = textDate.getFullYear() + (textDate.getMonth()/12);
                    const interval = t.planner_row.recurMonths/12;
                    const currentNum = currentDate.getFullYear() + (currentDate.getMonth()/12);
                    const intervals = Math.floor((currentNum - textNum)/interval);
                    let prev = textNum + (intervals * interval);
                    let prevYear = Math.floor(prev);
                    let prevDate = new Date(`${prevYear}/${(prev-prevYear)*12 + 1}/${textDate.getDate()} ${textDate.getHours()}:${textDate.getMinutes().toString().padStart(2, '0')}`);
                    if(prevDate.getTime() > currentDate.getTime()) {
                        prev = textNum + ((intervals - 1) * interval);
                        prevYear = Math.floor(prev);
                        prevDate = new Date(`${prevYear}/${(prev-prevYear)*12 + 1}/${textDate.getDate()} ${textDate.getHours()}:${textDate.getMinutes().toString().padStart(2, '0')}`);
                    }
                    return (lastDate.getTime() < prevDate.getTime());
                } else if (t.planner_row.recurDays) {
                    const diff = currentDate.getTime() - textDate.getTime();
                    const iterationTime = (t.planner_row.recurDays * (1000*60*60*24));
                    const iterations = Math.floor(diff/iterationTime);
                    const newTextTime = textDate.getTime() + (iterations * iterationTime);
                    return lastDate.getTime() < newTextTime;
                }
            } else {
                return textDate.getTime() < currentDate.getTime();
            }
        });
        await db.update(plannerRowTable).set({lastText: new Date().toLocaleString('en-US')}).where(inArray(plannerRowTable.id, overdue.map(o => o.planner_row.id)));
    }

    return texts;
}