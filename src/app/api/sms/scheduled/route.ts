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
    const texts = await listTexts(true);
    const overdue = texts.filter(txt => {
        return (txt.time < Date.now());
    });

    overdue.forEach(t => {
        sendText(t.text, t.recipient);
    });

    return new Response('', {status: 200});
}