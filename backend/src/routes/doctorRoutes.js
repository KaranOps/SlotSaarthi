import express from 'express';
import { createDoctor, getAllDoctors, getDoctorById } from '../controllers/doctorController.js';

const router = express.Router();

router.post('/', createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

export default router;
