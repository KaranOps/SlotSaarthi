import express from 'express';
import { bookToken, updateTokenStatus } from '../controllers/tokenController.js';

const router = express.Router();

router.post('/book', bookToken);
router.patch('/:tokenId/status', updateTokenStatus);

export default router;
