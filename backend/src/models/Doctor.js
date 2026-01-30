import mongoose from 'mongoose';
import {
    DEFAULT_DURATION,
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
    DEFAULT_WORKING_DAYS
} from '../../config/settings.js';

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    specialty: {
        type: String,
        required: [true, 'Specialty is required'],
        trim: true
    },
    consultationDuration: {
        type: Number,
        required: true,
        min: [5, 'Consultation duration must be at least 5 minutes'],
        default: DEFAULT_DURATION
    },
    availability: {
        startTime: {
            type: String,
            default: DEFAULT_START_TIME,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
        },
        endTime: {
            type: String,
            default: DEFAULT_END_TIME,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
        }
    },
    workingDays: {
        type: [Number],
        default: DEFAULT_WORKING_DAYS,
        validate: {
            validator: function (days) {
                return days.every(d => d >= 0 && d <= 6);
            },
            message: 'Working days must be between 0 (Sunday) and 6 (Saturday)'
        }
    },
    // Kept for backward compatibility
    averageConsultationTime: {
        type: Number,
        min: [1, 'Consultation time must be at least 1 minute'],
        default: DEFAULT_DURATION
    }
}, {
    timestamps: true
});

// Pre-save hook to sync consultationDuration with averageConsultationTime
doctorSchema.pre('save', function (next) {
    if (this.isModified('consultationDuration')) {
        this.averageConsultationTime = this.consultationDuration;
    }
    next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
