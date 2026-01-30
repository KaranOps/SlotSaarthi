import axios from 'axios';

/**
 * Axios instance configured for the backend API
 */
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Doctor API endpoints
 */
export const doctorAPI = {
    create: (data) => api.post('/doctors', data),
    getAll: () => api.get('/doctors'),
    getById: (id) => api.get(`/doctors/${id}`),
    update: (id, data) => api.put(`/doctors/${id}`, data)
};

/**
 * Slot API endpoints
 */
export const slotAPI = {
    initialize: (doctorId, startHour, endHour) =>
        api.post('/slots/initialize', { doctorId, startHour, endHour }),
    getAvailable: (doctorId, date) =>
        api.get(`/slots/available/${doctorId}/${date}`),
    getByDoctor: (doctorId) => api.get(`/slots/${doctorId}`),
    getCurrent: (doctorId) => api.get(`/slots/${doctorId}/current`)
};

/**
 * Token API endpoints
 */
export const tokenAPI = {
    book: (data) => api.post('/tokens/book', data),
    updateStatus: (tokenId, status) =>
        api.patch(`/tokens/${tokenId}/status`, { status }),
    callNext: (doctorId) => api.post(`/tokens/next/${doctorId}`),
    cancel: (tokenId) => api.patch(`/tokens/${tokenId}/cancel`),
    markNoShow: (tokenId) => api.patch(`/tokens/${tokenId}/no-show`)
};

/**
 * Queue API endpoints
 */
export const queueAPI = {
    get: (doctorId, date) => {
        const params = date ? { date } : {};
        return api.get(`/queue/${doctorId}`, { params });
    }
};

export default api;
