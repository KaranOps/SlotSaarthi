import Doctor from '../models/Doctor.js';

/**
 * Create a new doctor
 * POST /api/doctors
 */
export const createDoctor = async (req, res, next) => {
    try {
        const { name, specialty, averageConsultationTime } = req.body;

        const doctor = new Doctor({
            name,
            specialty,
            averageConsultationTime
        });

        await doctor.save();

        res.status(201).json({
            success: true,
            data: doctor,
            message: 'Doctor created successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all doctors
 * GET /api/doctors
 */
export const getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single doctor by ID
 * GET /api/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        next(error);
    }
};
