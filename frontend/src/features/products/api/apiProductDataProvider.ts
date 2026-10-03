import { ProductDataProvider, Category } from './productDataProvider';
import { Product } from '@/types/product';
import { apiClient } from '@/lib/api/client';
import { mockProductDataProvider } from './mockProductDataProvider';

export const apiProductDataProvider: ProductDataProvider = {
  getProducts: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product[] }>('/api/v1/products');
      return response.data || (response as unknown as Product[]);
    } catch (err) {
      console.warn('[apiProductDataProvider] Falling back to mock products due to API unavailability:', err);
      return mockProductDataProvider.getProducts();
    }
  },
  
  getCategories: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Category[] }>('/api/v1/categories');
      return response.data || (response as unknown as Category[]);
    } catch (err) {
      console.warn('[apiProductDataProvider] Falling back to mock categories due to API unavailability:', err);
      return mockProductDataProvider.getCategories();
    }
  },
  
  getProductById: async (id: string) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/v1/products/${id}`);
      return response.data || (response as unknown as Product);
    } catch (err) {
      console.warn('[apiProductDataProvider] Falling back to mock product by id due to API unavailability:', err);
      return mockProductDataProvider.getProductById(id);
    }
  },
  
  getProductBySlug: async (slug: string) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product }>(`/api/v1/products/${slug}`);
      return response.data || (response as unknown as Product);
    } catch (err) {
      console.warn('[apiProductDataProvider] Falling back to mock product by slug due to API unavailability:', err);
      return mockProductDataProvider.getProductBySlug(slug);
    }
  },
  
  getProductsByCategory: async (category: string) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product[] }>(`/api/v1/products/category/${encodeURIComponent(category)}`);
      return response.data || (response as unknown as Product[]);
    } catch (err) {
      console.warn('[apiProductDataProvider] Falling back to mock products by category due to API unavailability:', err);
      return mockProductDataProvider.getProductsByCategory(category);
    }
  },
  
  getFeaturedProducts: async (limit?: number) => {
    try {
      const url = limit ? `/api/v1/products?isFeatured=true&limit=${limit}` : '/api/v1/products?isFeatured=true';
      const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
      return response.data || (response as unknown as Product[]);
    } catch {
      return mockProductDataProvider.getFeaturedProducts(limit);
    }
  },
  
  getBestSellingProducts: async (limit?: number) => {
    try {
      const url = limit ? `/api/v1/products?isBestSeller=true&limit=${limit}` : '/api/v1/products?isBestSeller=true';
      const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
      return response.data || (response as unknown as Product[]);
    } catch {
      return mockProductDataProvider.getBestSellingProducts(limit);
    }
  },
  
  getNewArrivals: async (limit?: number) => {
    try {
      const url = limit ? `/api/v1/products?isNew=true&limit=${limit}` : '/api/v1/products?isNew=true';
      const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
      return response.data || (response as unknown as Product[]);
    } catch {
      return mockProductDataProvider.getNewArrivals(limit);
    }
  },
  
  getRelatedProducts: async (productId: string, limit?: number) => {
    try {
      const url = limit ? `/api/v1/products/${productId}/related?limit=${limit}` : `/api/v1/products/${productId}/related`;
      const response = await apiClient.get<{ success: boolean; data: Product[] }>(url);
      return response.data || (response as unknown as Product[]);
    } catch {
      return mockProductDataProvider.getRelatedProducts(productId, limit);
    }
  },
  
  searchProducts: async (query: string, options?: { signal?: AbortSignal }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Product[] }>(
        `/api/v1/products?search=${encodeURIComponent(query)}`,
        { signal: options?.signal }
      );
      return response.data || (response as unknown as Product[]);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        throw err;
      }
      return mockProductDataProvider.searchProducts(query);
    }
  },

  searchCatalog: async (query: string, options?: { signal?: AbortSignal; maxPrice?: number; minPrice?: number; category?: string }) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (options?.category) params.append('category', options.category);
      if (options?.maxPrice !== undefined) params.append('maxPrice', options.maxPrice.toString());
      if (options?.minPrice !== undefined) params.append('minPrice', options.minPrice.toString());

      const response = await apiClient.get<any>(
        `/api/v1/products?${params.toString()}`,
        { signal: options?.signal }
      );
      return {
        results: response.data || [],
        total: response.total ?? (response.data?.length || 0),
        query,
        cleanTerm: response.cleanTerm,
        appliedPriceFilter: response.appliedPriceFilter,
        budgetShortcuts: response.budgetShortcuts || [],
        didYouMean: response.didYouMean || null,
        matchedCategories: response.matchedCategories || [],
        fallbackRecommendations: response.fallbackRecommendations,
        fallbackCategories: response.fallbackCategories,
      };
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        throw err;
      }
      return (mockProductDataProvider as any).searchCatalog(query, options);
    }
  }
};
