import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

  // Initialize token from localStorage after component mounts
  useEffect(() => {
    try {
      const storedToken = typeof window !== 'undefined' && window.localStorage
        ? localStorage.getItem('token')
        : null;
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setLoading(false);
    }
  }, []);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadProfile();
    }
  }, [token]);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to load profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', newToken);
        }
      } catch (error) {
        console.error('Error saving token to localStorage:', error);
      }

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
        name
      });

      const { token: newToken, user: userData } = response.data;

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', newToken);
        }
      } catch (error) {
        console.error('Error saving token to localStorage:', error);
      }

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, apiKey: response.data.apiKey };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Check if user should be redirected to dashboard
  const shouldRedirectToDashboard = () => {
    return isAuthenticated && window.location.pathname === '/';
  };

  const refreshProfile = async () => {
    if (isAuthenticated) {
      await loadProfile();
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    shouldRedirectToDashboard,
    API_BASE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};