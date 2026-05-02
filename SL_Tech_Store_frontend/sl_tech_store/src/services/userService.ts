import api from './api';
import type { ApiResponse, User, Product } from '../types';

export const userService = {
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  updateProfile: (name?: string, phone?: string) =>
    api.put<ApiResponse<User>>(`/users/profile`, null, { params: { name, phone } }),
  addAddress: (address: Record<string, unknown>) =>
    api.post<ApiResponse<User>>('/users/addresses', address),
  updateAddress: (id: string, address: Record<string, unknown>) =>
    api.put<ApiResponse<User>>(`/users/addresses/${id}`, address),
  removeAddress: (id: string) =>
    api.delete<ApiResponse<User>>(`/users/addresses/${id}`),
  addPaymentMethod: (method: Record<string, unknown>) =>
    api.post<ApiResponse<User>>('/users/payment-methods', method),
  removePaymentMethod: (id: string) =>
    api.delete<ApiResponse<User>>(`/users/payment-methods/${id}`),
  getWishlist: () =>
    api.get<ApiResponse<Product[]>>('/users/wishlist'),
  addToWishlist: (productId: string) =>
    api.post<ApiResponse<User>>(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId: string) =>
    api.delete<ApiResponse<User>>(`/users/wishlist/${productId}`),
  getAllUsers: () => api.get<ApiResponse<User[]>>('/users/admin/all'),
  updateRole: (userId: string, role: string) =>
    api.put<ApiResponse<User>>(`/users/admin/${userId}/role?role=${role}`),
};
