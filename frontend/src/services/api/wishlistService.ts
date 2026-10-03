import { apiClient } from '@/lib/api/client';

export interface BackendWishlistItem {
  productId: string;
  title: string;
  price: number;
  image?: string;
  slug?: string;
  addedAt?: string | Date;
}

export const wishlistApiService = {
  getWishlist: async () => {
    return apiClient.get<{ success: boolean; data: BackendWishlistItem[] }>('/api/v1/wishlist');
  },

  addItem: async (item: { productId: string; title?: string; price?: number; image?: string; slug?: string }) => {
    return apiClient.post<{ success: boolean; data: BackendWishlistItem[] }>('/api/v1/wishlist/items', item);
  },

  removeItem: async (productId: string) => {
    return apiClient.delete<{ success: boolean; data: BackendWishlistItem[] }>(
      `/api/v1/wishlist/items/${encodeURIComponent(productId)}`
    );
  },

  clearWishlist: async () => {
    return apiClient.delete<{ success: boolean; data: BackendWishlistItem[] }>('/api/v1/wishlist');
  },

  mergeWishlist: async (
    items: Array<{ productId: string; title?: string; price?: number; image?: string; slug?: string }>
  ) => {
    return apiClient.post<{ success: boolean; data: BackendWishlistItem[] }>('/api/v1/wishlist/merge', {
      items,
    });
  },
};
