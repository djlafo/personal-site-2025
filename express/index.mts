import { Router } from 'express';
const router = Router();

import sms from './sms/index.mts';

router.use('/sms', sms);

export default router;