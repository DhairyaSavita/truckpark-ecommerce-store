import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Use env var for API URL — falls back to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Attach token to every request automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 responses (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export { api };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the full user profile (includes all role flags like is_technician, is_driver, etc.)
  const fetchFullProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      return null;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchFullProfile();
    }
    setLoading(false);
  }, [fetchFullProfile]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;

    // Store token and set header
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch the complete profile so all role flags are available
    await fetchFullProfile();

    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token } = response.data;

    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch full profile after registration
    await fetchFullProfile();

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Allow other components to refresh user state (e.g. after profile update)
  const refreshUser = () => fetchFullProfile();

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
