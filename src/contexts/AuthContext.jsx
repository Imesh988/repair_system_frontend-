import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
  console.log('🔵 Frontend login attempt:', email);
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Login response:', response);
    console.log('Response data:', response.data);
    
    const { token: newToken, user: userData } = response.data;
    console.log('Token received:', newToken);
    console.log('User data:', userData);
    
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    toast.success('Login successful!');
    console.log('✅ State updated, navigating to dashboard');
    return true;
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error response:', error.response);
    toast.error(error.response?.data?.message || 'Login failed');
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'admin' || user?.role === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};