
import { createContext, useState, useContext, useEffect } from 'react';
import { API_CONFIG, apiCall } from '../services/api';

const AuthContext = createContext(null);

const sanitizeToken = (value) => {
    if (!value) return '';
    const normalized = String(value).trim();
    if (normalized === 'undefined' || normalized === 'null') return '';
    return normalized;
};

const resolveTokenFromResponse = (response) => {
    return sanitizeToken(
        response?.token ||
        response?.authToken ||
        response?.data?.token ||
        response?.data?.authToken ||
        response?.user?.token ||
        response?.user?.authToken
    );
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sanitizeToken(localStorage.getItem('authToken')));
    const [isAuthenticated, setIsAuthenticated] = useState(!!sanitizeToken(localStorage.getItem('authToken')));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = sanitizeToken(localStorage.getItem('authToken'));
        const storedUser = localStorage.getItem('userData');

        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } else {
            localStorage.removeItem('authToken');
            setToken('');
            setIsAuthenticated(false);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            const authToken = resolveTokenFromResponse(response);

            if (response.success || authToken) {
                if (!authToken) {
                    return { success: false, message: 'Login sem token valido retornado pela API' };
                }

                const userData = response.user || { email }; // Fallback if user data not provided
                const userId = userData.id || response.userId || response?.data?.userId || response?.data?.id;

                localStorage.setItem('authToken', authToken);
                localStorage.setItem('userData', JSON.stringify(userData));
                if (userId !== undefined && userId !== null) {
                    localStorage.setItem('userId', String(userId));
                }
                localStorage.setItem('isLoggedIn', 'true');

                setToken(authToken);
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, message: response.message || 'Login falhou' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');

        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = (profileData) => {
        setUser(prev => ({ ...prev, ...profileData }));
        localStorage.setItem('userData', JSON.stringify({ ...user, ...profileData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
