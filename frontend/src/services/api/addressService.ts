import { apiClient } from '@/lib/api/client';

export interface CustomerAddress {
  _id?: string;
  id?: string;
  label?: string;
  type?: 'home' | 'work' | 'other';
  street?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  isDefault?: boolean;
}

export const addressService = {
  getAddresses: async () => {
    return apiClient.get<{ success: boolean; data: CustomerAddress[] }>('/api/v1/users/addresses');
  },

  createAddress: async (data: Partial<CustomerAddress>) => {
    return apiClient.post<{ success: boolean; data: CustomerAddress }>('/api/v1/users/addresses', data);
  },

  updateAddress: async (id: string, data: Partial<CustomerAddress>) => {
    return apiClient.patch<{ success: boolean; data: CustomerAddress }>(`/api/v1/users/addresses/${id}`, data);
  },

  deleteAddress: async (id: string) => {
    return apiClient.delete<{ success: boolean; data: { addressId: string } }>(`/api/v1/users/addresses/${id}`);
  },

  setDefaultAddress: async (id: string) => {
    return apiClient.patch<{ success: boolean; data: CustomerAddress }>(`/api/v1/users/addresses/${id}/default`, {});
  },
};
