import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Warn if API_URL is not configured properly in production
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error(
    '[ERROR] VITE_API_URL is not defined. This will cause API calls to fail in production.\n' +
    'Please ensure .env.production contains: VITE_API_URL=https://careermatch-ai.onrender.com'
  );
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Normalize URL to avoid duplicated '/api' when baseURL already ends with '/api'
    const base = api.defaults.baseURL || '';
    if (base.endsWith('/api') && config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

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
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password');
    const isHandledError = code === 'USER_NOT_FOUND' || code === 'INVALID_PASSWORD';
    
    if (!isAuthRoute && status !== 401 && !isHandledError) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
