import { OrderDataProvider } from './orderDataProvider';
import { Order } from '@/types/order';
import { OrderDetail } from '../types';
import { apiClient } from '@/lib/api/client';

export const apiOrderDataProvider: OrderDataProvider = {
  getOrders: async () => {
    // Note: Storefront orders endpoint requires credentials since it returns user-specific orders
    const response = await apiClient.get<{ success: boolean; data: Order[] }>('/api/v1/orders', {
      credentials: 'include'
    });
    return response.data || (response as unknown as Order[]);
  },
  
  getOrderById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: OrderDetail }>(`/api/v1/orders/${id}`, {
      credentials: 'include'
    });
    return response.data || (response as unknown as OrderDetail);
  }
};
