import express from 'express';
import { initializeSlots, getDoctorSlots, getCurrentSlot, getAvailableSlots } from '../controllers/slotController.js';

const router = express.Router();

router.post('/initialize', initializeSlots);
router.get('/available/:doctorId/:date', getAvailableSlots);
router.get('/:doctorId', getDoctorSlots);
router.get('/:doctorId/current', getCurrentSlot);

export default router;
