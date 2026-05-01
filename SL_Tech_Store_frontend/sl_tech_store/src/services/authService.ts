import api from './api';
import type { ApiResponse, AuthResponse } from '../types';

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  googleLogin: (token: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/google', { token }),
};
