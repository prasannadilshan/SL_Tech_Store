import { create } from 'zustand';
import type { AuthResponse } from '../types';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(getCookie('user') || 'null'),
  isAuthenticated: !!getCookie('token'),
  login: (data: AuthResponse) => {
    setCookie('token', data.token);
    setCookie('user', JSON.stringify(data));
    set({ user: data, isAuthenticated: true });
  },
  logout: () => {
    removeCookie('token');
    removeCookie('user');
    set({ user: null, isAuthenticated: false });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
}));
