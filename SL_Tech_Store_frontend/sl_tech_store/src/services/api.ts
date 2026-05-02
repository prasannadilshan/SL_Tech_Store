import axios from 'axios';
import { getCookie, removeCookie } from '../utils/cookies';

export const API_BASE_URL = 'http://localhost:8080/api';
export const BACKEND_URL = 'http://localhost:8080';

// Helper to resolve image URLs (handles both relative and absolute URLs)
export const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return BACKEND_URL + url;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor
api.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeCookie('token');
      removeCookie('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
