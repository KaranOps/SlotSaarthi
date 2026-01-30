import mongoose from 'mongoose';

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
    averageConsultationTime: {
        type: Number,
        required: [true, 'Average consultation time is required'],
        min: [1, 'Consultation time must be at least 1 minute'],
        default: 10
    }
}, {
    timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
