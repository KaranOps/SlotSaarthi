import Doctor from '../models/Doctor.js';
import Token from '../models/Token.js';
import { DEFAULT_DURATION } from '../../config/settings.js';

class SlotManager {
    parseTimeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTimeString(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    calculateSlots(startTime, endTime, duration = DEFAULT_DURATION) {
        const slots = [];
        const startMinutes = this.parseTimeToMinutes(startTime);
        const endMinutes = this.parseTimeToMinutes(endTime);

        let currentMinutes = startMinutes;
        while (currentMinutes + duration <= endMinutes) {
            slots.push(this.minutesToTimeString(currentMinutes));
            currentMinutes += duration;
        }

        return slots;
    }

    async getAvailableSlots(doctorId, date) {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.getDay();

        if (!doctor.workingDays.includes(dayOfWeek)) {
            return {
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    specialty: doctor.specialty
                },
                date: appointmentDate,
                isWorkingDay: false,
                availableSlots: [],
                message: 'Doctor does not work on this day'
            };
        }

        const allSlots = this.calculateSlots(
            doctor.availability.startTime,
            doctor.availability.endTime,
            doctor.consultationDuration
        );

        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedTokens = await Token.find({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['Pending', 'Active'] }
        }).select('scheduledStartTime');

        const bookedTimes = new Set(bookedTokens.map(t => t.scheduledStartTime));

        const now = new Date();
        const isToday = appointmentDate.toDateString() === now.toDateString();
        const currentTimeMinutes = isToday ? (now.getHours() * 60 + now.getMinutes()) : 0;

        const availableSlots = allSlots.map(time => {
            const slotMinutes = this.parseTimeToMinutes(time);
            const isPast = isToday && slotMinutes <= currentTimeMinutes;

            return {
                time,
                available: !bookedTimes.has(time) && !isPast,
                isPast
            };
        });

        const availableCount = availableSlots.filter(s => s.available).length;

        return {
            doctor: {
                id: doctor._id,
                name: doctor.name,
                specialty: doctor.specialty,
                consultationDuration: doctor.consultationDuration
            },
            date: appointmentDate,
            isWorkingDay: true,
            isToday,
            totalSlots: allSlots.length,
            bookedCount: bookedTimes.size,
            availableCount,
            slots: availableSlots
        };
    }

    async isSlotAvailable(doctorId, date, time) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingToken = await Token.findOne({
            doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            scheduledStartTime: time,
            status: { $in: ['Pending', 'Active'] }
        });

        return !existingToken;
    }
}

export default new SlotManager();
