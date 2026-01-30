import Token from '../models/Token.js';
import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import SlotService from './SlotService.js';
import SlotManager from './SlotManager.js';
import { PRIORITY_WEIGHTS, MAX_OVERFLOW_CAPACITY, AGING_FACTOR } from '../../config/settings.js';

class TokenService {
    /**
     * Allocate a token to a patient with appointment scheduling
     */
    async allocateToken({ doctorId, patientType, patientName, appointmentDate, scheduledStartTime }) {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const bookingDate = new Date(appointmentDate);
        const dayOfWeek = bookingDate.getDay();

        if (!doctor.workingDays.includes(dayOfWeek)) {
            throw new Error('Doctor does not work on this day');
        }

        const isEmergency = patientType === 'Emergency';

        if (!isEmergency) {
            const isAvailable = await SlotManager.isSlotAvailable(doctorId, bookingDate, scheduledStartTime);
            if (!isAvailable) {
                throw new Error('This time slot is already booked. Please select another slot.');
            }
        } else {
            const startOfDay = new Date(bookingDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(bookingDate);
            endOfDay.setHours(23, 59, 59, 999);

            const emergencyCount = await Token.countDocuments({
                doctorId,
                appointmentDate: { $gte: startOfDay, $lte: endOfDay },
                scheduledStartTime,
                patientType: 'Emergency',
                status: { $in: ['Pending', 'Active'] }
            });

            if (emergencyCount >= MAX_OVERFLOW_CAPACITY) {
                throw new Error('Emergency overflow capacity reached for this slot.');
            }
        }

        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const totalTokensToday = await Token.countDocuments({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay }
        });
        const arrivalSequence = totalTokensToday + 1;

        const basePriority = PRIORITY_WEIGHTS[patientType];
        const finalPriorityScore = basePriority + (arrivalSequence * 0.01);

        const doctorIdStr = doctorId.toString();
        const doctorIdSuffix = doctorIdStr.substring(doctorIdStr.length - 3);
        const dateCode = bookingDate.toISOString().slice(5, 10).replace('-', '');
        const timestamp = Date.now().toString().slice(-4);
        const tokenID = `DOC-${doctorIdSuffix}-${dateCode}-${String(arrivalSequence).padStart(3, '0')}-${timestamp}`;

        const token = await Token.create({
            tokenID,
            patientName,
            patientType,
            doctorId,
            appointmentDate: bookingDate,
            scheduledStartTime,
            basePriority,
            finalPriorityScore,
            status: 'Pending'
        });

        return {
            tokenID: token.tokenID,
            patientName: token.patientName,
            patientType: token.patientType,
            appointmentDate: token.appointmentDate,
            scheduledStartTime: token.scheduledStartTime,
            status: token.status,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                specialty: doctor.specialty
            },
            estimatedTime: scheduledStartTime
        };
    }

    /**
     * Get queue with dynamic priority (aging mechanism)
     * EffectivePriorityScore = BasePriority - (WaitingMinutes * AGING_FACTOR)
     */
    async getQueue(doctorId, date = new Date()) {
        const queryDate = new Date(date);
        const startOfDay = new Date(queryDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(queryDate);
        endOfDay.setHours(23, 59, 59, 999);

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const tokens = await Token.find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['Pending', 'Active'] }
        }).lean();

        const now = new Date();

        const processedTokens = tokens.map(token => {
            const waitTimeMinutes = Math.floor((now - new Date(token.createdAt)) / 60000);
            const agingReduction = waitTimeMinutes * AGING_FACTOR;

            let effectivePriorityScore;
            if (token.patientType === 'Emergency') {
                effectivePriorityScore = 0;
            } else {
                effectivePriorityScore = Math.max(0, token.basePriority - agingReduction);
            }

            return {
                ...token,
                waitTimeMinutes,
                effectivePriorityScore
            };
        });

        const sortedTokens = processedTokens.sort((a, b) => {
            if (a.effectivePriorityScore !== b.effectivePriorityScore) {
                return a.effectivePriorityScore - b.effectivePriorityScore;
            }
            if (a.scheduledStartTime !== b.scheduledStartTime) {
                return a.scheduledStartTime.localeCompare(b.scheduledStartTime);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        const activeToken = sortedTokens.find(t => t.status === 'Active');
        const pendingTokens = sortedTokens.filter(t => t.status === 'Pending');
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const upcomingTokens = pendingTokens.filter(t => t.scheduledStartTime >= currentTime);

        return {
            doctor: {
                id: doctor._id,
                name: doctor.name,
                specialty: doctor.specialty
            },
            date: queryDate,
            currentToken: activeToken || null,
            nextToken: upcomingTokens[0] || null,
            waitingList: pendingTokens,
            totalCount: tokens.length
        };
    }

    async updateTokenStatus(tokenId, status) {
        const token = await Token.findByIdAndUpdate(
            tokenId,
            { status },
            { new: true, runValidators: true }
        );

        if (!token) {
            throw new Error('Token not found');
        }

        return token;
    }

    async callNextPatient(doctorId) {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        await Token.findOneAndUpdate(
            {
                doctorId,
                appointmentDate: { $gte: startOfDay, $lte: endOfDay },
                status: 'Active'
            },
            { status: 'Completed' }
        );

        const nextToken = await Token.findOneAndUpdate(
            {
                doctorId,
                appointmentDate: { $gte: startOfDay, $lte: endOfDay },
                status: 'Pending'
            },
            { status: 'Active' },
            { new: true, sort: { scheduledStartTime: 1, finalPriorityScore: 1 } }
        );

        return nextToken;
    }

    async cancelToken(tokenId) {
        const token = await Token.findById(tokenId);

        if (!token) {
            throw new Error('Token not found');
        }

        if (token.status === 'Completed') {
            throw new Error('Cannot cancel a completed token');
        }
        if (token.status === 'Cancelled' || token.status === 'No_Show') {
            throw new Error('Token is already cancelled');
        }

        token.status = 'Cancelled';
        token.cancellationTime = new Date();
        await token.save();

        console.log(`Token ${token.tokenID} cancelled`);

        return token;
    }

    async markNoShow(tokenId) {
        const token = await Token.findById(tokenId);

        if (!token) {
            throw new Error('Token not found');
        }

        if (token.status === 'Completed') {
            throw new Error('Cannot mark a completed token as no-show');
        }
        if (token.status === 'Cancelled' || token.status === 'No_Show') {
            throw new Error('Token is already cancelled or marked as no-show');
        }

        token.status = 'No_Show';
        token.cancellationTime = new Date();
        await token.save();

        console.log(`Token ${token.tokenID} marked as No-Show`);

        return token;
    }
}

export default new TokenService();
