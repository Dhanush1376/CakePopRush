import { apiClient } from '@/lib/api/client';

export interface AssignedOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  customer?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: string;
  }>;
  total: number;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  status: string;
  internalStatus?: string;
  actualDelivery?: string;
  deliveryOtp?: string;
  shippingAddress?: {
    recipientName: string;
    phone: string;
    alternatePhone?: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    deliveryInstructions?: string;
  };
  delivery: {
    status?: string;
    agentId?: string;
    assignedAt?: string;
    pickedUpAt?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
    otpAttempts?: number;
    otpExpiresAt?: string;
    otpSentAt?: string;
    isCodCollected?: boolean;
    codAmountCollected?: number;
  };
  createdAt: string;
}

export interface DeliveryProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  role: string;
  city?: string;
  createdAt: string;
  todayDeliveries: number;
  completedDeliveries: number;
  activeDeliveries: number;
}

const formatQuery = (search?: string) => {
  if (!search) return '';
  return search.startsWith('?') ? search : `?${search}`;
};

export const deliveryAgentService = {
  getProfile: async (search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.get<{ success: boolean; data: DeliveryProfile }>(
      `/api/v1/delivery/me${q}`,
      { credentials: 'include' }
    );
    return res.data;
  },

  updateStatus: async (isActive: boolean, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.patch<{ success: boolean; message: string; data: { isActive: boolean } }>(
      `/api/v1/delivery/me/status${q}`,
      { isActive },
      { credentials: 'include' }
    );
    return res.data;
  },

  getAssignedOrders: async (search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.get<{ success: boolean; data: AssignedOrder[] }>(
      `/api/v1/delivery/orders${q}`,
      { credentials: 'include' }
    );
    return res.data || [];
  },

  getOrderDetail: async (id: string, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.get<{ success: boolean; data: AssignedOrder }>(
      `/api/v1/delivery/orders/${encodeURIComponent(id)}${q}`,
      { credentials: 'include' }
    );
    return res.data;
  },

  acceptOrder: async (id: string, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.post<{ success: boolean; message: string; data: AssignedOrder }>(
      `/api/v1/delivery/orders/${encodeURIComponent(id)}/accept${q}`,
      {},
      { credentials: 'include' }
    );
    return res.data;
  },

  pickupOrder: async (id: string, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.post<{ success: boolean; message: string; data: AssignedOrder }>(
      `/api/v1/delivery/orders/${encodeURIComponent(id)}/pickup${q}`,
      {},
      { credentials: 'include' }
    );
    return res.data;
  },

  updateLocation: async (id: string, coords: { latitude: number; longitude: number; heading?: number }, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.post<{ success: boolean; data: { latitude: number; longitude: number; heading?: number; updatedAt: string } }>(
      `/api/v1/delivery/orders/${encodeURIComponent(id)}/location${q}`,
      coords,
      { credentials: 'include' }
    );
    return res.data;
  },

  sendDeliveryOtp: async (id: string, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.post<{ success: boolean; message: string; data?: any }>(
      `/api/v1/delivery/orders/${encodeURIComponent(id)}/send-otp${q}`,
      {},
      { credentials: 'include' }
    );
    return res;
  },

  verifyDeliveryOtp: async (id: string, payload: { otp: string; codConfirmed?: boolean; codAmountCollected?: number }, search?: string) => {
    const q = formatQuery(search);
    const res = await apiClient.post<{ success: boolean; message: string; data: AssignedOrder }>(
      `/api/v1/delivery/orders/${encodeURIComponent(id)}/verify-otp${q}`,
      payload,
      { credentials: 'include' }
    );
    return res;
  },
};


export default deliveryAgentService;
