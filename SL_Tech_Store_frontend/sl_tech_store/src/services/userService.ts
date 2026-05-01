import api from './api';
import type { ApiResponse, User } from '../types';

export const userService = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  updateProfile: (name?: string, phone?: string) =>
    api.put<ApiResponse<User>>(`/users/profile`, null, { params: { name, phone } }),
  addAddress: (address: Record<string, unknown>) =>
    api.post<ApiResponse<User>>('/users/addresses', address),
  removeAddress: (id: string) =>
    api.delete<ApiResponse<User>>(`/users/addresses/${id}`),
  addToWishlist: (productId: string) =>
    api.post<ApiResponse<User>>(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId: string) =>
    api.delete<ApiResponse<User>>(`/users/wishlist/${productId}`),
  getAllUsers: () => api.get<ApiResponse<User[]>>('/users/admin/all'),
  updateRole: (userId: string, role: string) =>
    api.put<ApiResponse<User>>(`/users/admin/${userId}/role?role=${role}`),
};
