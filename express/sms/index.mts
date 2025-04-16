import twilio from 'twilio';
import bodyParser from 'body-parser';
import { Router } from 'express';

twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWITCH_AUTH_TOKEN);

const router = Router();

router.use(bodyParser.urlencoded({ extended: false }));

// protocol: 'https', host: '4917-2600-8807-2a01-2200-00-5bc9.ngrok-free.app'
// https://github.com/twilio/twilio-node/issues/505
// WHY DONT THEY DOCUMENT THIS
router.post('/', twilio.webhook(), (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    // const zip = test.get('FromZip');
    // const state = test.get('FromState');
    // const city = test.get('FromCity');
    // const body = test.get('Body');
    // const number = test.get('From');

    twiml.message(`Got it! Received: ${req.body.Body} from ${req.body.From}`);

    res.type('text/xml')
        .send(twiml.toString());
});

router.get('/', (_, res) => {
    res.send(`testing: ${process.env.TWILIO_AUTH_TOKEN}`);
});

export default router;