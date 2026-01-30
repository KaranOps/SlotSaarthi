import express from 'express';
import { createDoctor, getAllDoctors, getDoctorById, updateDoctor } from '../controllers/doctorController.js';

const router = express.Router();

router.post('/', createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', updateDoctor);

export default router;
