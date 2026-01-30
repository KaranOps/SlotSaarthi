import express from 'express';
import { getQueue } from '../controllers/tokenController.js';

const router = express.Router();

router.get('/:doctorId', getQueue);

export default router;
