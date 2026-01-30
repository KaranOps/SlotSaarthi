import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import { SLOT_DURATION_MINUTES, DEFAULT_MAX_CAPACITY } from '../../config/settings.js';

/**
 * Service for managing time slots
 */
class SlotService {
    /**
     * Generate slots for a doctor for the current day
     * @param {string} doctorId - The doctor's ObjectId
     * @param {Object} options - Optional configuration
     * @param {number} options.startHour - Start hour for slots (default: 9)
     * @param {number} options.endHour - End hour for slots (default: 17)
     * @returns {Promise<Array>} Array of created slot documents
     */
    async initializeDailySlots(doctorId, options = {}) {
        const { startHour = 9, endHour = 17 } = options;

        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if slots already exist for this doctor today
        const existingSlots = await Slot.findOne({
            doctorId,
            startTime: { $gte: today }
        });

        if (existingSlots) {
            throw new Error('Slots already initialized for this doctor today');
        }

        // Calculate number of slots
        const totalHours = endHour - startHour;
        const slotsCount = Math.floor((totalHours * 60) / SLOT_DURATION_MINUTES);

        const slots = [];
        for (let i = 0; i < slotsCount; i++) {
            const startTime = new Date(today);
            startTime.setHours(startHour, 0, 0, 0);
            startTime.setMinutes(startTime.getMinutes() + (i * SLOT_DURATION_MINUTES));

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + SLOT_DURATION_MINUTES);

            slots.push({
                doctorId,
                startTime,
                endTime,
                maxCapacity: DEFAULT_MAX_CAPACITY,
                currentCount: 0,
                isFull: false
            });
        }

        const createdSlots = await Slot.insertMany(slots);
        return createdSlots;
    }

    /**
     * Get the current active slot for a doctor
     * @param {string} doctorId - The doctor's ObjectId
     * @returns {Promise<Object|null>} The active slot or null
     */
    async getCurrentSlot(doctorId) {
        const now = new Date();

        return await Slot.findOne({
            doctorId,
            startTime: { $lte: now },
            endTime: { $gt: now }
        });
    }

    /**
     * Get all slots for a doctor for today
     * @param {string} doctorId - The doctor's ObjectId
     * @returns {Promise<Array>} Array of slot documents
     */
    async getTodaySlots(doctorId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await Slot.find({
            doctorId,
            startTime: { $gte: today, $lt: tomorrow }
        }).sort({ startTime: 1 });
    }

    /**
     * Find the next available slot for booking
     * @param {string} doctorId - The doctor's ObjectId
     * @param {boolean} isEmergency - Whether this is an emergency booking
     * @returns {Promise<Object|null>} The available slot or null
     */
    async findAvailableSlot(doctorId, isEmergency = false) {
        const now = new Date();

        // First try to get current active slot
        let slot = await Slot.findOne({
            doctorId,
            startTime: { $lte: now },
            endTime: { $gt: now },
            ...(isEmergency ? {} : { isFull: false })
        });

        // If no active slot or full, get next available slot
        if (!slot) {
            slot = await Slot.findOne({
                doctorId,
                startTime: { $gt: now },
                ...(isEmergency ? {} : { isFull: false })
            }).sort({ startTime: 1 });
        }

        return slot;
    }
}

export default new SlotService();
