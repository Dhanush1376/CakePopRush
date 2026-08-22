import { ProductDataProvider, Category } from './productDataProvider';
import { Product } from '@/types/product';
import { apiClient } from '@/lib/api/client';

export const apiProductDataProvider: ProductDataProvider = {
  getProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>('/api/v1/products');
    return response.data || (response as unknown as Product[]);
  },
  
  getCategories: async () => {
    const response = await apiClient.get<{ success: boolean; data: Category[] }>('/api/v1/categories');
    return response.data || (response as unknown as Category[]);
  },
  
  getProductById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/v1/products/${id}`);
    return response.data || (response as unknown as Product);
  },
  
  getProductBySlug: async (slug: string) => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/v1/products/${slug}`);
    return response.data || (response as unknown as Product);
  },
  
  getProductsByCategory: async (category: string) => {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(`/api/v1/products/category/${encodeURIComponent(category)}`);
    return response.data || (response as unknown as Product[]);
  },
  
  getFeaturedProducts: async (limit?: number) => {
    const url = limit ? `/api/v1/products?isFeatured=true&limit=${limit}` : '/api/v1/products?isFeatured=true';
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
    return response.data || (response as unknown as Product[]);
  },
  
  getBestSellingProducts: async (limit?: number) => {
    const url = limit ? `/api/v1/products?isBestSeller=true&limit=${limit}` : '/api/v1/products?isBestSeller=true';
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
    return response.data || (response as unknown as Product[]);
  },
  
  getNewArrivals: async (limit?: number) => {
    const url = limit ? `/api/v1/products?isNew=true&limit=${limit}` : '/api/v1/products?isNew=true';
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
    return response.data || (response as unknown as Product[]);
  },
  
  getRelatedProducts: async (productId: string, limit?: number) => {
    const url = limit ? `/api/v1/products/${productId}/related?limit=${limit}` : `/api/v1/products/${productId}/related`;
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
    return response.data || (response as unknown as Product[]);
  },
  
  searchProducts: async (query: string) => {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(`/api/v1/products?search=${encodeURIComponent(query)}`);
    return response.data || (response as unknown as Product[]);
  }
};
