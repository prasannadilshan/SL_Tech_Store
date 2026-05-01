import api from './api';
import type { ApiResponse, Order, PagedResponse } from '../types';

export const orderService = {
  createOrder: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Order>>('/orders', data),
  getUserOrders: (page = 0, size = 10) =>
    api.get<ApiResponse<PagedResponse<Order>>>(`/orders?page=${page}&size=${size}`),
  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),
  getAllOrders: (page = 0, size = 10, status?: string) =>
    api.get<ApiResponse<PagedResponse<Order>>>(`/orders/admin/all`, { params: { page, size, status } }),
  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/status?status=${status}`),
  updateTracking: (id: string, trackingNumber: string) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/tracking?trackingNumber=${trackingNumber}`),
};
