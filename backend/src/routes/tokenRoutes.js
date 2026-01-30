import express from 'express';
import { bookToken, updateTokenStatus, callNextPatient, cancelToken, markNoShow } from '../controllers/tokenController.js';

const router = express.Router();

router.post('/book', bookToken);
router.patch('/:tokenId/status', updateTokenStatus);
router.post('/next/:doctorId', callNextPatient);
router.patch('/:tokenId/cancel', cancelToken);
router.patch('/:tokenId/no-show', markNoShow);

export default router;
