import axios from 'axios';

// Use VITE_API_URL from environment, fallback to /api for local dev with proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const doctorAPI = {
    create: (data) => api.post('/doctors', data),
    getAll: () => api.get('/doctors'),
    getById: (id) => api.get(`/doctors/${id}`),
    update: (id, data) => api.put(`/doctors/${id}`, data)
};

export const slotAPI = {
    initialize: (doctorId, startHour, endHour) =>
        api.post('/slots/initialize', { doctorId, startHour, endHour }),
    getAvailable: (doctorId, date) =>
        api.get(`/slots/available/${doctorId}/${date}`),
    getByDoctor: (doctorId) => api.get(`/slots/${doctorId}`),
    getCurrent: (doctorId) => api.get(`/slots/${doctorId}/current`)
};

export const tokenAPI = {
    book: (data) => api.post('/tokens/book', data),
    updateStatus: (tokenId, status) =>
        api.patch(`/tokens/${tokenId}/status`, { status }),
    callNext: (doctorId) => api.post(`/tokens/next/${doctorId}`),
    cancel: (tokenId) => api.patch(`/tokens/${tokenId}/cancel`),
    markNoShow: (tokenId) => api.patch(`/tokens/${tokenId}/no-show`)
};

export const queueAPI = {
    get: (doctorId, date) => {
        const params = date ? { date } : {};
        return api.get(`/queue/${doctorId}`, { params });
    }
};

export default api;
