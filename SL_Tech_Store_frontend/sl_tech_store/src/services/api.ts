import axios from 'axios';
import { getCookie, removeCookie } from '../utils/cookies';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper to resolve image URLs (handles both relative and absolute URLs)
export const getImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Convert Google Drive links to direct view format using a robust regex
  const driveMatch = url.match(/(?:id=|\/d\/|drive\.google\.com\/file\/d\/|drive\.google\.com\/uc\?id=)([\w-]+)/);
  if (driveMatch && driveMatch[1]) {
    // thumbnail?id=ID&sz=w1000 is the most reliable way to embed Google Drive images
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  }

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
