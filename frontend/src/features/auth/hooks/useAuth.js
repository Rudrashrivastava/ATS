import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as authApi from '../services/auth.api';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(credentials);
      if (data.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
    return false;
  }, []);

  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    setError('');
    try {
      const data = await authApi.register(userData);
      setSuccess(data.message || 'Registration successful!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return { token, loading, error, success, handleLogin, handleRegister, logout, setError, setSuccess };
};

