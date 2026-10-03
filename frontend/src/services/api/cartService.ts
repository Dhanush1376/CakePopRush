import { apiClient } from '@/lib/api/client';

export interface BackendCartItem {
  id?: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  variantId?: string;
  variantName?: string;
  customization?: any;
  priceModifier?: number;
  compareAtPrice?: number;
}

export interface BackendCartResponse {
  items: BackendCartItem[];
  totalItems: number;
  subtotal: number;
  compareAtSubtotal: number;
  totalDiscount: number;
  shippingFee: number;
  total: number;
  droppedItems?: Array<{ productId: string; reason: string }>;
}

export interface AddToCartPayload {
  productId: string;
  quantity?: number;
  variantId?: string;
  variantName?: string;
  customization?: any;
}

export const cartService = {
  getCart: async () => {
    return apiClient.get<{ success: boolean; data: BackendCartResponse }>('/api/v1/cart');
  },

  addItem: async (payload: AddToCartPayload) => {
    return apiClient.post<{ success: boolean; data: BackendCartResponse }>('/api/v1/cart/items', payload);
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    return apiClient.patch<{ success: boolean; data: BackendCartResponse }>(
      `/api/v1/cart/items/${encodeURIComponent(itemId)}`,
      { quantity }
    );
  },

  removeItem: async (itemId: string) => {
    return apiClient.delete<{ success: boolean; data: BackendCartResponse }>(
      `/api/v1/cart/items/${encodeURIComponent(itemId)}`
    );
  },

  clearCart: async () => {
    return apiClient.delete<{ success: boolean; data: BackendCartResponse }>('/api/v1/cart');
  },

  mergeCart: async (items: any[]) => {
    return apiClient.post<{ success: boolean; data: BackendCartResponse }>('/api/v1/cart/merge', {
      items,
    });
  },
};
