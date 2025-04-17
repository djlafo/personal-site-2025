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

    const twiml = new twilio.twiml.MessagingResponse();
    // const zip = test.get('FromZip');
    // const state = test.get('FromState');
    // const city = test.get('FromCity');
    // const body = test.get('Body');
    // const number = test.get('From');
    console.log(`Text received from ${fd.get('From')}: ${fd.get('Body')}`);
    // twiml.message(`Got it! Received: ${req.body.Body} from ${req.body.From}`);
    return new Response('', {status: 200});
}
