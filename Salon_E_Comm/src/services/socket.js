import { io } from 'socket.io-client';

// Intelligently derive Socket URL
const getSocketURL = () => {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;

    const apiURL = import.meta.env.VITE_API_BASE_URL || '';
    if (apiURL.includes('/api/v1')) {
        return apiURL.replace('/api/v1', '');
    }

    return 'http://localhost:5000';
};

const SOCKET_URL = getSocketURL();
console.log(`[Socket Service] Initialized with URL: ${SOCKET_URL}`);

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true
});

export default socket;
