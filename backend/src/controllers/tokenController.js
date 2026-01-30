import { TokenService } from '../services/index.js';

export const bookToken = async (req, res, next) => {
    try {
        const { doctorId, patientType, patientName, appointmentDate, scheduledStartTime } = req.body;

        if (!doctorId || !patientType || !patientName || !appointmentDate || !scheduledStartTime) {
            return res.status(400).json({
                success: false,
                message: 'doctorId, patientType, patientName, appointmentDate, and scheduledStartTime are required'
            });
        }

        const token = await TokenService.allocateToken({
            doctorId,
            patientType,
            patientName,
            appointmentDate,
            scheduledStartTime
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

export const getQueue = async (req, res, next) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        const queueData = await TokenService.getQueue(doctorId, date);

        res.status(200).json({
            success: true,
            data: queueData
        });
    } catch (error) {
        next(error);
    }
};

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

export const callNextPatient = async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        const token = await TokenService.callNextPatient(doctorId);

        if (!token) {
            return res.status(404).json({
                success: false,
                message: 'No pending patients in queue'
            });
        }

        res.status(200).json({
            success: true,
            data: token,
            message: 'Next patient called'
        });
    } catch (error) {
        next(error);
    }
};

export const cancelToken = async (req, res, next) => {
    try {
        const { tokenId } = req.params;

        const token = await TokenService.cancelToken(tokenId);

        res.status(200).json({
            success: true,
            data: token,
            message: 'Token cancelled'
        });
    } catch (error) {
        if (error.message.includes('Cannot cancel') || error.message.includes('already')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

export const markNoShow = async (req, res, next) => {
    try {
        const { tokenId } = req.params;

        const token = await TokenService.markNoShow(tokenId);

        res.status(200).json({
            success: true,
            data: token,
            message: 'Token marked as No-Show'
        });
    } catch (error) {
        if (error.message.includes('Cannot mark') || error.message.includes('already')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};
