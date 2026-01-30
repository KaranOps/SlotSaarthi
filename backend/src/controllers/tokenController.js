import { TokenService } from '../services/index.js';

/**
 * Book a token for a patient
 * POST /api/tokens/book
 */
export const bookToken = async (req, res, next) => {
    try {
        const { doctorId, patientType, patientName } = req.body;

        // Validate required fields
        if (!doctorId || !patientType || !patientName) {
            return res.status(400).json({
                success: false,
                message: 'doctorId, patientType, and patientName are required'
            });
        }

        const token = await TokenService.allocateToken({
            doctorId,
            patientType,
            patientName
        });

        res.status(201).json({
            success: true,
            data: token,
            message: 'Token booked successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get the queue for a doctor
 * GET /api/queue/:doctorId
 */
export const getQueue = async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        const queueData = await TokenService.getQueue(doctorId);

        res.status(200).json({
            success: true,
            data: queueData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update token status
 * PATCH /api/tokens/:tokenId/status
 */
export const updateTokenStatus = async (req, res, next) => {
    try {
        const { tokenId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const token = await TokenService.updateTokenStatus(tokenId, status);

        res.status(200).json({
            success: true,
            data: token,
            message: 'Token status updated'
        });
    } catch (error) {
        next(error);
    }
};
