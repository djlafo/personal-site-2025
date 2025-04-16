import twilio from 'twilio';
import bodyParser from 'body-parser';
import { Router } from 'express';

twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWITCH_AUTH_TOKEN);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));

// protocol: 'https', host: '4917-2600-8807-2a01-2200-00-5bc9.ngrok-free.app'
// https://github.com/twilio/twilio-node/issues/505
// WHY DONT THEY DOCUMENT THIS
router.post('/', (req, res) => {
    const valid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN || '',
        req.headers['x-twilio-signature']?.toString() || '',
        process.env.TWILIO_ENDPOINT || '',
        req.body
    )
    if(!valid) {
        console.log('Unauthorized text');
        res.status(401).send('Unauthorized');
        return;
    }

    const twiml = new twilio.twiml.MessagingResponse();
    // const zip = test.get('FromZip');
    // const state = test.get('FromState');
    // const city = test.get('FromCity');
    // const body = test.get('Body');
    // const number = test.get('From');
    console.log(`Text received from ${req.body.From}: ${req.body.Body}`);
    // twiml.message(`Got it! Received: ${req.body.Body} from ${req.body.From}`);

    // res.type('text/xml')
    //     .send(twiml.toString());
});

export default router;