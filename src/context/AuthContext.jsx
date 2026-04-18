
import { createContext, useState, useContext, useEffect } from 'react';
import { API_CONFIG, apiCall } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');

        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.success || response.token) {
                const authToken = response.token;
                const userData = response.user || { email }; // Fallback if user data not provided

                localStorage.setItem('authToken', authToken);
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('userId', userData.id || response.userId); // Ensure userId is saved
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
