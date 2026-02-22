import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
    getMetrics: () => axios.get(`${API_URL}/admin/metrics`),
    getTransactions: (params) => axios.get(`${API_URL}/payments`, { params }),
    createPayment: (data, headers) => axios.post(`${API_URL}/payments`, data, { headers }),
    retryPayment: (id) => axios.post(`${API_URL}/payments/${id}/retry`)
};
