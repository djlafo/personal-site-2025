import { checkWSAuth } from "@/lib/sessions";
import { sendText } from "@/lib/twilio";

interface TextEventData {
    time: number;
    text: string;
    recipient: string;
}
export async function POST(req: Request) {
    if(!checkWSAuth(req)) return new Response('', {status: 401});

    const ted: TextEventData = await req.json();
    await sendText(ted.text, ted.recipient);

    return new Response('', {status: 200});
}
