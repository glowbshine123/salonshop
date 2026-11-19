const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    }
};

export const removeAuthToken = () => {
    localStorage.removeItem('token');
};

const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            removeAuthToken();
            window.location.href = '/auth/signin';
            throw new Error('Unauthorized. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const err = new Error(errorData.message || `HTTP Error: ${response.status}`);
            err.status = response.status;
            err.details = errorData.details || errorData.errors || null;
            throw err;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const authAPI = {
    register: async (userData) => {
        const response = await fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (response.token) {
            setAuthToken(response.token);
        }
        return response;
    },

    login: async (email, password) => {
        const response = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.token) {
            setAuthToken(response.token);
        }
        return response;
    },

    changePassword: async (passwordData) => {
        return fetchAPI('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData),
        });
    },

    getMe: async () => {
        return fetchAPI('/auth/me', {
            method: 'GET',
        });
    },

    logout: () => {
        removeAuthToken();
    },
};

export const productAPI = {
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/products${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    },

    getById: async (productId) => {
        return fetchAPI(`/products/${productId}`, { method: 'GET' });
    },

    create: async (productData) => {
        const body = productData instanceof FormData ? productData : JSON.stringify(productData);
        return fetchAPI('/products', {
            method: 'POST',
            body,
        });
    },

    update: async (productId, productData) => {
        const body = productData instanceof FormData ? productData : JSON.stringify(productData);
        return fetchAPI(`/products/${productId}`, {
            method: 'PATCH',
            body,
        });
    },

    delete: async (productId) => {
        return fetchAPI(`/products/${productId}`, { method: 'DELETE' });
    },
};

export const orderAPI = {
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/orders${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    },

    getMyOrders: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/orders/me${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    },

    getAssigned: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/orders/assigned${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    },

    assignAgent: async (orderId, agentId) => {
        return fetchAPI(`/orders/${orderId}/assign-agent`, {
            method: 'PATCH',
            body: JSON.stringify({ agentId })
        });
    },

    getById: async (orderId) => {
        return fetchAPI(`/orders/${orderId}`, { method: 'GET' });
    },

    create: async (orderData) => {
        return fetchAPI('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    update: async (orderId, orderData) => {
        return fetchAPI(`/orders/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify(orderData),
        });
    },

    updateStatus: async (orderId, status) => {
        return fetchAPI(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },
};

export const commissionAPI = {
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/commissions${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    },

    getById: async (commissionId) => {
        return fetchAPI(`/commissions/${commissionId}`, { method: 'GET' });
    },

    getMy: async () => {
        return fetchAPI('/commissions/me', { method: 'GET' });
    },

    create: async (commissionData) => {
        return fetchAPI('/commissions', {
            method: 'POST',
            body: JSON.stringify(commissionData),
        });
    },

    update: async (commissionId, commissionData) => {
        return fetchAPI(`/commissions/${commissionId}`, {
            method: 'PATCH',
            body: JSON.stringify(commissionData),
        });
    },
};

export const paymentAPI = {
    createRazorpayOrder: async (amount, orderId, currency = 'INR', receipt = null) => {
        return fetchAPI('/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({ amount, currency, receipt, orderId }),
        });
    },

    verifyPayment: async (payload) => {
        return fetchAPI('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
};

export const categoryAPI = {
    getAll: async () => {
        return fetchAPI('/categories', { method: 'GET' });
    },
    create: async (name) => {
        return fetchAPI('/categories', { method: 'POST', body: JSON.stringify({ name }) });
    },
    delete: async (id) => {
        return fetchAPI(`/categories/${id}`, { method: 'DELETE' });
    }
};

export const userAPI = {
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/users${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    },

    getAgents: async () => {
        return fetchAPI('/users/agents', { method: 'GET' });
    },

    getById: async (userId) => {
        return fetchAPI(`/users/${userId}`, { method: 'GET' });
    },

    create: async (userData) => {
        return fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    updateProfile: async (userData) => {
        const body = userData instanceof FormData ? userData : JSON.stringify(userData);
        // Note: fetchAPI automatically sets Content-Type to application/json if body is NOT FormData
        return fetchAPI('/users/profile', {
            method: 'PUT',
            body,
        });
    }
};

export const adminAPI = {
    getDashboardStats: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/admin/dashboard-stats${queryParams ? '?' + queryParams : ''}`;
        return fetchAPI(endpoint, { method: 'GET' });
    }
};

export const settingsAPI = {
    get: async () => {
        return fetchAPI('/settings', { method: 'GET' });
    },
    update: async (data) => {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return fetchAPI('/settings', {
            method: 'PUT',
            body
        });
    }
};

export const cartAPI = {
    getCart: async () => {
        return fetchAPI('/cart', { method: 'GET' });
    },

    addToCart: async (productId, quantity = 1) => {
        return fetchAPI('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    updateCart: async (productId, quantity) => {
        return fetchAPI(`/cart/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity }),
        });
    },

    removeFromCart: async (productId) => {
        return fetchAPI(`/cart/${productId}`, { method: 'DELETE' });
    },

    clearCart: async () => {
        return fetchAPI('/cart', { method: 'DELETE' });
    },

    getCartTotal: async () => {
        return fetchAPI('/cart/total', { method: 'GET' });
    },
};
