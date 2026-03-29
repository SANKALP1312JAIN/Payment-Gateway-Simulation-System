import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Retry helper: retries up to `retries` times with `delayMs` between attempts.
// Handles Render free-tier cold starts gracefully.
const withRetry = async (fn, retries = 3, delayMs = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const isLast = attempt === retries;
            const shouldRetry = !err.response || err.response.status >= 500;
            if (isLast || !shouldRetry) throw err;
            await new Promise(res => setTimeout(res, delayMs));
        }
    }
};

export const api = {
    getMetrics: () => withRetry(() => axios.get(`${API_URL}/admin/metrics`)),
    getTransactions: (params) => withRetry(() => axios.get(`${API_URL}/payments`, { params })),
    createPayment: (data, headers) => axios.post(`${API_URL}/payments`, data, { headers }),
    retryPayment: (id) => axios.post(`${API_URL}/payments/${id}/retry`)
};
