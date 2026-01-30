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
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: [true, 'Slot ID is required']
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
    }
}, {
    timestamps: true
});

// Index for efficient queue queries
tokenSchema.index({ slotId: 1, finalPriorityScore: 1, createdAt: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
