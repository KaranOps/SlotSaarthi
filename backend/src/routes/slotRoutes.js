import express from 'express';
import { initializeSlots, getDoctorSlots, getCurrentSlot } from '../controllers/slotController.js';

const router = express.Router();

router.post('/initialize', initializeSlots);
router.get('/:doctorId', getDoctorSlots);
router.get('/:doctorId/current', getCurrentSlot);

export default router;
