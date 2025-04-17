import { TextEventData } from "@/actions/wss";
import { checkWSAuth } from "@/lib/sessions";
import { sendText } from "@/lib/twilio";

export async function POST(req: Request) {
    if(!checkWSAuth(req)) return new Response('', {status: 401});

    const ted: TextEventData = await req.json();
    await sendText(ted.text, ted.recipient);

    return new Response('', {status: 200});
}
