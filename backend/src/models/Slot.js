import mongoose from 'mongoose';
import { DEFAULT_MAX_CAPACITY } from '../../config/settings.js';

const slotSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    maxCapacity: {
        type: Number,
        default: DEFAULT_MAX_CAPACITY
    },
    currentCount: {
        type: Number,
        default: 0
    },
    isFull: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual to check if slot is currently active
slotSchema.virtual('isActive').get(function () {
    const now = new Date();
    return now >= this.startTime && now < this.endTime;
});

// Update isFull based on currentCount
slotSchema.pre('save', function (next) {
    this.isFull = this.currentCount >= this.maxCapacity;
    next();
});

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
