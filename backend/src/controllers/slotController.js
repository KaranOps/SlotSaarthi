import { SlotService } from '../services/index.js';

/**
 * Initialize daily slots for a doctor
 * POST /api/slots/initialize
 */
export const initializeSlots = async (req, res, next) => {
    try {
        const { doctorId, startHour, endHour } = req.body;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID is required'
            });
        }

        const slots = await SlotService.initializeDailySlots(doctorId, {
            startHour,
            endHour
        });

        res.status(201).json({
            success: true,
            count: slots.length,
            data: slots,
            message: `${slots.length} slots created for today`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get today's slots for a doctor
 * GET /api/slots/:doctorId
 */
export const getDoctorSlots = async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        const slots = await SlotService.getTodaySlots(doctorId);

        res.status(200).json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current active slot for a doctor
 * GET /api/slots/:doctorId/current
 */
export const getCurrentSlot = async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        const slot = await SlotService.getCurrentSlot(doctorId);

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'No active slot at the moment'
            });
        }

        res.status(200).json({
            success: true,
            data: slot
        });
    } catch (error) {
        next(error);
    }
};
