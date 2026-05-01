import api from './api';
import type { ApiResponse, Product, PagedResponse } from '../types';

export const productService = {
  getProducts: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<PagedResponse<Product>>>('/products', { params }),

  getProduct: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  getFeatured: () =>
    api.get<ApiResponse<Product[]>>('/products/featured'),

  getLatest: () =>
    api.get<ApiResponse<Product[]>>('/products/latest'),

  getTopRated: () =>
    api.get<ApiResponse<Product[]>>('/products/top-rated'),

  createProduct: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Product>>('/products', data),

  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),

  uploadImage: (id: string, file: File, isPrimary: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<Product>>(`/products/${id}/images?isPrimary=${isPrimary}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (id: string, driveFileId: string) =>
    api.delete(`/products/${id}/images/${driveFileId}`),
};
