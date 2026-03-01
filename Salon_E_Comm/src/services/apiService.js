import axios from 'axios';

// API Base URL derivation
const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_BASE_URL;
    if (envURL) return envURL;

    // If no env var, and we are on localhost, default to local backend
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api/v1';
    }

    // Fallback for production if env var is missing
    return '/api/v1';
};

const API_BASE_URL = getBaseURL();
console.log(`[API Service] Initialized with baseURL: ${API_BASE_URL}`);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/signin';
        }
        if (error.response?.status === 403) {
            console.warn('[API Service] 403 Forbidden Error:', error.config?.url);
            window.dispatchEvent(new CustomEvent('authForbidden'));
        }
        return Promise.reject(error);
    }
);


export const authAPI = {
    login: async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        return res;
    },
    register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
        }
        return res;
    },
    me: () => api.get('/auth/me'),
};

// Rewards
export const rewardAPI = {
    getRewardWallet: () => api.get('/rewards/wallet'),
    getRewardTransactions: (params) => api.get('/rewards/transactions', { params }),
};

// System Settings
export const settingsAPI = {
    get: async () => {
        const res = await api.get('/settings');
        return res.data;
    },
    getSystemSettings: async () => {
        const res = await api.get('/settings');
        return res.data;
    },
    update: async (data) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const res = await api.put('/settings', data, { headers });
        return res.data;
    },
};

export const systemSettingsAPI = settingsAPI;


export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return api.post('/products', data, { headers });
    },
    update: (id, data) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return api.patch(`/products/${id}`, data, { headers });
    },
    delete: (id) => api.delete(`/products/${id}`),
    getReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
    addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
    getMyReviews: () => api.get('/products/user/my-reviews'),
};


export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getMyOrders: (params) => api.get('/orders/me', { params }),
    getAssigned: (params) => api.get('/orders/assigned', { params }),
    assignAgent: (orderId, agentId) => api.patch(`/orders/${orderId}/assign-agent`, { agentId }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};


export const categoryAPI = {
    getAll: (params) => api.get('/categories', { params }),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.patch(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};


export const commissionAPI = {
    getAll: (params) => api.get('/commissions', { params }),
    getMyCommissions: () => api.get('/commissions/me'),
};


export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getAgents: () => api.get('/users/agents'),
    getById: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return api.put('/users/profile', data, { headers });
    },
    createInternal: (data) => api.post('/users', data),
    updateStatus: (id, status) => api.post(`/users/${id}/status`, { status }),
    assignAgent: (id, agentId) => api.post(`/users/${id}/assign-agent`, { agentId }),
};


export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getCount: () => api.get('/notifications/unread-count'),
};


export const paymentAPI = {
    createOrder: (data) => api.post('/payments/create-order', data),
    verify: (data) => api.post('/payments/verify', data),
};


export const agentAPI = {
    getDashboard: () => api.get('/agent/dashboard'),
    getSalons: () => api.get('/agent/salons'),
    registerSalonOwner: (data) => userAPI.createInternal({ ...data, role: 'SALON_OWNER' }),
    getTransactions: (params) => api.get('/agent/transactions', { params }),
    getSettlements: (params) => api.get('/agent/settlements', { params }),
};


export const adminAPI = {
    getSettlements: (params) => api.get('/admin/settlements', { params }),
    triggerAutoSettlement: () => api.post('/admin/settlements/trigger-auto'),
    createAgent: (data) => userAPI.createInternal({ ...data, role: 'AGENT' }),
    getSlabs: () => api.get('/admin/commission-slabs'),
    createSlab: (data) => api.post('/admin/commission-slabs', data),
    updateSlab: (id, data) => api.put(`/admin/commission-slabs/${id}`, data),
};


export const cartAPI = {
    get: () => api.get('/cart'),
    add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
    update: (productId, quantity) => api.patch(`/cart/${productId}`, { quantity }),
    remove: (productId) => api.delete(`/cart/${productId}`),
    clear: () => api.delete('/cart'),
};


export const payoutAPI = {
    updateSettings: (data) => api.post('/payout/settings', data),
    getAll: (params) => api.get('/admin/payouts', { params }),
    updateStatus: (id, status) => api.patch(`/admin/payouts/${id}/status`, { status }),
};

export default api;
