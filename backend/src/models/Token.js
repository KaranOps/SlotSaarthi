import mongoose from 'mongoose';
import { PATIENT_TYPES, TOKEN_STATUSES } from '../../config/settings.js';

const tokenSchema = new mongoose.Schema({
    tokenID: {
        type: String,
        unique: true,
        required: [true, 'Token ID is required']
    },
    patientName: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true
    },
    patientType: {
        type: String,
        enum: {
            values: PATIENT_TYPES,
            message: '{VALUE} is not a valid patient type'
        },
        required: [true, 'Patient type is required']
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot'
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    scheduledStartTime: {
        type: String,
        required: [true, 'Scheduled start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    basePriority: {
        type: Number,
        required: true
    },
    finalPriorityScore: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: TOKEN_STATUSES,
            message: '{VALUE} is not a valid status'
        },
        default: 'Pending'
    },
    cancellationTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queue queries
tokenSchema.index({ doctorId: 1, appointmentDate: 1, scheduledStartTime: 1 });
tokenSchema.index({ slotId: 1, finalPriorityScore: 1, createdAt: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
