import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const url = error.config?.url || '';
    
    // Handle unauthorized (token expired) - redirect to login
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Don't show toast for login/register page errors - handled by components
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
    const isHandledError = code === 'USER_NOT_FOUND' || code === 'INVALID_PASSWORD';
    
    if (!isAuthRoute && status !== 401 && !isHandledError) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
