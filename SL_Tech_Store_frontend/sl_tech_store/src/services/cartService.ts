import api from './api';
import type { ApiResponse, Cart } from '../types';

export const cartService = {
  getCart: () => api.get<ApiResponse<Cart>>('/cart'),
  addToCart: (productId: string, quantity: number = 1) =>
    api.post<ApiResponse<Cart>>(`/cart/add?productId=${productId}&quantity=${quantity}`),
  updateItem: (productId: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/update?productId=${productId}&quantity=${quantity}`),
  removeItem: (productId: string) =>
    api.delete<ApiResponse<Cart>>(`/cart/remove/${productId}`),
  clearCart: () => api.delete<ApiResponse<void>>('/cart/clear'),
};
