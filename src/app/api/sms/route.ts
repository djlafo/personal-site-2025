import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

export async function GET() {
    return new Response('hey');
}

export async function POST(request: Request) {
    const twiml = new MessagingResponse();

    // const test = await request.formData();
    // const zip = test.get('FromZip');
    // const state = test.get('FromState');
    // const city = test.get('FromCity');
    // const body = test.get('Body');
    // const number = test.get('From');

    twiml.message(`Got it!`);

    return new Response(twiml.toString(), {
        status: 200,
        headers: {
            'Content-Type': 'text/xml'
        }
    });
}