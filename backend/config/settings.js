// Slot Configuration
export const SLOT_DURATION_MINUTES = 60;
export const DEFAULT_DURATION = 15;
export const DEFAULT_MAX_CAPACITY = 10;
export const MAX_OVERFLOW_CAPACITY = 1;

// Priority Configuration (Lower = Higher Priority)
export const PRIORITY_WEIGHTS = {
    Emergency: 0,
    Paid: 10,
    Online: 20,
    Walk_in: 30,
    Follow_up: 40
};

// Aging Factor: Every 2 minutes of waiting reduces priority score by 1 point
export const AGING_FACTOR = 0.5;

export const PATIENT_TYPES = Object.keys(PRIORITY_WEIGHTS);

export const TOKEN_STATUSES = ['Pending', 'Active', 'Completed', 'Cancelled', 'No_Show'];

// Default Working Hours
export const DEFAULT_START_TIME = '09:00';
export const DEFAULT_END_TIME = '17:00';
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];

// Server Configuration
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slotsaarthi';

export default {
    SLOT_DURATION_MINUTES,
    DEFAULT_DURATION,
    DEFAULT_MAX_CAPACITY,
    MAX_OVERFLOW_CAPACITY,
    PRIORITY_WEIGHTS,
    AGING_FACTOR,
    PATIENT_TYPES,
    TOKEN_STATUSES,
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
    DEFAULT_WORKING_DAYS,
    PORT,
    MONGODB_URI
};
