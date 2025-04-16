import { Router } from 'express';
const router = Router();

import sms from './sms/index.mts';

router.get('/', (_, res) => {
    res.status(200).send('Hey :)');
});

router.use('/sms', sms);

export default router;