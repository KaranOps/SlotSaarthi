/**
 * Global Configuration for OPD Token Allocation Engine
 * All business logic constants must be imported from here.
 */

export const SLOT_DURATION_MINUTES = 60;

export const DEFAULT_MAX_CAPACITY = 10;

export const PRIORITY_WEIGHTS = {
    Emergency: 0,
    Paid: 10,
    Online: 20,
    Walk_in: 30,
    Follow_up: 40
};

export const AGING_FACTOR = 1; // Value to subtract from priority score per minute of waiting

export const PATIENT_TYPES = Object.keys(PRIORITY_WEIGHTS);

export const TOKEN_STATUSES = ['Pending', 'Active', 'Completed', 'Cancelled'];

// Server configuration
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/slotsaarthi';

export default {
    SLOT_DURATION_MINUTES,
    DEFAULT_MAX_CAPACITY,
    PRIORITY_WEIGHTS,
    AGING_FACTOR,
    PATIENT_TYPES,
    TOKEN_STATUSES,
    PORT,
    MONGODB_URI
};
