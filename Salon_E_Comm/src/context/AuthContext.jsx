import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await authAPI.me();
                    setUser(res.data);
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const res = await authAPI.login(credentials);
            const { token, ...userData } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            window.dispatchEvent(new CustomEvent('authChange'));
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const res = await authAPI.register(userData);
            const { token, ...data } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            window.dispatchEvent(new CustomEvent('authChange'));
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new CustomEvent('authChange'));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
