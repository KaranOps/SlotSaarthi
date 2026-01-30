import Token from '../models/Token.js';
import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import SlotService from './SlotService.js';
import { PRIORITY_WEIGHTS } from '../../config/settings.js';

/**
 * Service for managing patient tokens and queue allocation
 */
class TokenService {
    /**
     * Allocate a token to a patient
     * Implements priority calculation and elastic capacity check
     * 
     * @param {Object} data - Token request data
     * @param {string} data.doctorId - The doctor's ObjectId
     * @param {string} data.patientType - Type of patient (Emergency, Paid, Online, Walk_in, Follow_up)
     * @param {string} data.patientName - Patient's name
     * @returns {Promise<Object>} Created token document
     * @throws {Error} If slot is full for non-emergency or doctor not found
     */
    async allocateToken(data) {
        const { doctorId, patientType, patientName } = data;

        // Validate patient type
        if (!PRIORITY_WEIGHTS.hasOwnProperty(patientType)) {
            throw new Error(`Invalid patient type: ${patientType}`);
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const isEmergency = patientType === 'Emergency';

        // Find available slot
        const slot = await SlotService.findAvailableSlot(doctorId, isEmergency);
        if (!slot) {
            throw new Error('No available slots for this doctor');
        }

        // Check capacity (Elastic Capacity Rule)
        if (slot.currentCount >= slot.maxCapacity && !isEmergency) {
            throw new Error('Slot is full. Please try the next available slot.');
        }

        // Get arrival sequence for this slot
        const tokenCountInSlot = await Token.countDocuments({ slotId: slot._id });
        const arrivalSequence = tokenCountInSlot + 1;

        // Calculate priority score
        // Lower score = Higher priority
        const basePriority = PRIORITY_WEIGHTS[patientType];
        const finalPriorityScore = basePriority + (arrivalSequence * 0.01);

        // Generate Token ID: DOC-{doctorIdLast3}-{sequence}
        const doctorIdStr = doctorId.toString();
        const doctorIdSuffix = doctorIdStr.substring(doctorIdStr.length - 3);
        const tokenID = `DOC-${doctorIdSuffix}-${String(arrivalSequence).padStart(3, '0')}`;

        // Create token
        const token = new Token({
            tokenID,
            patientName,
            patientType,
            slotId: slot._id,
            basePriority,
            finalPriorityScore,
            status: 'Pending'
        });

        await token.save();

        // Atomically increment slot count to prevent race conditions
        await Slot.findByIdAndUpdate(
            slot._id,
            {
                $inc: { currentCount: 1 },
                $set: { isFull: slot.currentCount + 1 >= slot.maxCapacity }
            },
            { new: true }
        );

        // Populate slot info for response
        await token.populate('slotId');

        return {
            ...token.toObject(),
            estimatedTime: this.calculateEstimatedTime(slot, finalPriorityScore, doctor.averageConsultationTime)
        };
    }

    /**
     * Calculate estimated waiting time for a token
     * @param {Object} slot - The slot document
     * @param {number} priorityScore - The token's priority score
     * @param {number} avgConsultTime - Average consultation time in minutes
     * @returns {string} Estimated time string
     */
    calculateEstimatedTime(slot, priorityScore, avgConsultTime) {
        // Count tokens ahead in queue (lower priority score = ahead)
        const estimatedPosition = Math.floor(priorityScore);
        const waitMinutes = estimatedPosition * avgConsultTime;

        const estimatedTime = new Date(slot.startTime);
        estimatedTime.setMinutes(estimatedTime.getMinutes() + waitMinutes);

        return estimatedTime.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Get the current queue for a doctor's active slot
     * Sorted by finalPriorityScore (ascending) then createdAt (ascending)
     * 
     * @param {string} doctorId - The doctor's ObjectId
     * @returns {Promise<Object>} Queue data with tokens and slot info
     */
    async getQueue(doctorId) {
        // Get current or next slot
        const slot = await SlotService.getCurrentSlot(doctorId);

        if (!slot) {
            // If no current slot, get next upcoming slot
            const today = new Date();
            const nextSlot = await Slot.findOne({
                doctorId,
                startTime: { $gt: today }
            }).sort({ startTime: 1 });

            if (!nextSlot) {
                return { slot: null, tokens: [], message: 'No active or upcoming slots' };
            }

            const tokens = await Token.find({
                slotId: nextSlot._id,
                status: { $in: ['Pending', 'Active'] }
            })
                .sort({ finalPriorityScore: 1, createdAt: 1 })
                .lean();

            return { slot: nextSlot, tokens, isUpcoming: true };
        }

        // Get all tokens for current slot, sorted by priority
        const tokens = await Token.find({
            slotId: slot._id,
            status: { $in: ['Pending', 'Active'] }
        })
            .sort({ finalPriorityScore: 1, createdAt: 1 })
            .lean();

        return { slot, tokens, isUpcoming: false };
    }

    /**
     * Update token status
     * @param {string} tokenId - The token's ObjectId
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated token
     */
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
}

export default new TokenService();
