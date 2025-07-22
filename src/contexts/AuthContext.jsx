// contexts/AuthContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import API_URL from '../constants/api.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Storage helpers for web
const storage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
};

const isTokenExpired = (token) => {
    if (!token || typeof token !== 'string') {
        console.log('Invalid token type:', typeof token);
        return true;
    }

    // Check if token has the basic JWT structure (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
        console.log('Token does not have 3 parts:', parts.length);
        return true;
    }

    try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        return isExpired;
    } catch (e) {
        console.log('Token decode error in isTokenExpired:', e);
        return true; // Treat errors as expired
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Logout function (defined first so it can be used in useEffect)
    const logout = useCallback(async () => {
        try {
            // Clear state
            setToken(null);
            setUser(null);

            // Clear storage
            storage.removeItem('token');
            storage.removeItem('user');

            // Clear default headers
            delete axios.defaults.headers.common['Authorization'];

            return { success: true };
        } catch (error) {
            console.error('Logout error', error);
            return { success: false };
        }
    }, []);

    useEffect(() => {
        // Check if token exists in localStorage on app load
        const loadStoredAuth = async () => {
            try {
                const storedToken = storage.getItem('token');
                const storedUser = storage.getItem('user');

                if (storedToken && storedUser && !isTokenExpired(storedToken)) {
                    const parsedUser = JSON.parse(storedUser);

                    setToken(storedToken);
                    setUser(parsedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                } else {
                    await logout(); // Clean up expired session
                }
            } catch (error) {
                console.error('Error loading auth data', error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredAuth();
    }, [logout]);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const expiresAt = decoded.exp * 1000; // JWT exp is in seconds
                const timeout = expiresAt - Date.now();

                if (timeout > 0) {
                    const timer = setTimeout(() => {
                        logout(); // Auto logout when token expires
                    }, timeout);

                    return () => clearTimeout(timer); // Clean up on token/user change
                } else {
                    console.log('Token already expired');
                    logout(); // If token already expired somehow
                }
            } catch (err) {
                console.log('JWT decode error:', err);
                logout(); // Malformed token
            }
        }
    }, [token, logout]);

    // Login function
    const login = async (email, password) => {
        setError('');
        setLoading(true); // Set loading during login
        try {
            const response = await axios.post(`${API_URL}/api/login`, { email, password });
            const { token, user } = response.data;

            // Store in localStorage first
            storage.setItem('token', token);
            storage.setItem('user', JSON.stringify(user));

            // Then update state
            setToken(token);
            setUser(user);

            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage =
                error?.response?.data?.error || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        setError('');
        try {
            const response = await axios.post(`${API_URL}/users/register`, userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Update user data (useful for profile updates)
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        storage.setItem('user', JSON.stringify(updatedUser));
    };

    // Refresh token (if your API supports it)
    const refreshToken = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/refresh-token`, { token });
            const { token: newToken } = response.data;

            storage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            return { success: true };
        } catch (error) {
            console.error('Token refresh error:', error);
            await logout();
            return { success: false };
        }
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        refreshToken,
        isAuthenticated: !!token && !isTokenExpired(token)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};