import db from "@/db";
import { inArray } from 'drizzle-orm';
import { plannerRowTable } from "@/db/schema/plannerrow";
import { checkWSAuth } from "@/lib/sessions";
import { listTexts, sendText } from "@/lib/twilio";
import { TextEventData } from "@/actions/text";

export async function POST(req: Request) {
    if(!checkWSAuth(req)) return new Response('', {status: 401});

    const ted: TextEventData = await req.json();
    ted.texts.forEach(t => {
        sendText(t.text, t.recipient);
    });

    return new Response('', {status: 200});
}


export async function GET(req: Request) {
    if(!checkWSAuth(req)) return new Response('', {status: 401});

    // grab all alerts
    const texts = await listTexts();
    const overdue = texts.filter(txt => {
        return (new Date(txt.time) < new Date());
    });

    await db.update(plannerRowTable).set({text: false}).where(inArray(plannerRowTable.id, overdue.map(t => t.id)));
    
    overdue.forEach(t => {
        sendText(`Planner reminder: ${t.text}`, t.recipient);
    });

    return new Response('', {status: 200});
}