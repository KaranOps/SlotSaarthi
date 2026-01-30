import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Doctor API Endpoints
 */
export const doctorAPI = {
    create: (data) => api.post('/api/doctors', data),
    getAll: () => api.get('/api/doctors'),
    getById: (id) => api.get(`/api/doctors/${id}`)
};

/**
 * Slot API Endpoints
 */
export const slotAPI = {
    initialize: (doctorId, options = {}) =>
        api.post('/api/slots/initialize', { doctorId, ...options }),
    getForDoctor: (doctorId) => api.get(`/api/slots/${doctorId}`),
    getCurrent: (doctorId) => api.get(`/api/slots/${doctorId}/current`)
};

/**
 * Token API Endpoints
 */
export const tokenAPI = {
    book: (data) => api.post('/api/tokens/book', data),
    updateStatus: (tokenId, status) =>
        api.patch(`/api/tokens/${tokenId}/status`, { status })
};

/**
 * Queue API Endpoints
 */
export const queueAPI = {
    get: (doctorId) => api.get(`/api/queue/${doctorId}`)
};

export default api;
