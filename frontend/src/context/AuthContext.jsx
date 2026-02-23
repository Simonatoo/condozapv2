import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refreshUser();
    }, []);

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token) {
            // Seel only if there's no user yet to avoid flicker
            if (!user) {
                setUser(userData ? JSON.parse(userData) : { token });
            }

            try {
                const res = await api.get('/users/me');
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                return res.data;
            } catch (err) {
                console.error("Error fetching fresh user data", err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
        } else {
            console.warn("User data missing in login response");
            setUser({ token: res.data.token });
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
        } else {
            console.warn("User data missing in register response");
            setUser({ token: res.data.token });
        }
        return res.data;
    };

    const googleLogin = async (googleToken, apartment = null, telefone = null, condominios = null) => {
        const res = await api.post('/auth/google-login', { token: googleToken, apartment, telefone, condominios });

        if (res.data.needsRegistration) {
            return res.data; // Return registration requirement info
        }

        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
        } else {
            setUser({ token: res.data.token });
        }
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, googleLogin, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
