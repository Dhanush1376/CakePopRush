import { apiClient } from '@/lib/api/client';

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
    variant?: string;
    customizationNote?: string;
  }>;
  shippingAddress: {
    recipientName: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    type?: string;
    deliveryInstructions?: string;
  };
  paymentMethod: 'razorpay' | 'cod';
  couponCode?: string;
  notes?: string;
  idempotencyKey?: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const orderService = {
  create: async (payload: CreateOrderPayload, options?: { idempotencyKey?: string }) => {
    const key = options?.idempotencyKey || payload.idempotencyKey || `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        order: any;
        razorpayOrder?: {
          id: string;
          amount: number;
          currency: string;
        };
        type: 'online' | 'cod';
        isInstantCheckout: boolean;
      };
    }>('/api/v1/orders', { ...payload, idempotencyKey: key }, {
      credentials: 'include',
      headers: {
        'Idempotency-Key': key,
      },
    });
    return response;
  },

  verifyPayment: async (payload: VerifyPaymentPayload) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>('/api/v1/orders/verify-payment', payload, {
      credentials: 'include',
    });
    return response;
  },

  getMyOrders: async () => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: any[];
    }>('/api/v1/orders/my-orders', {
      credentials: 'include',
    });
    return response.data || [];
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/v1/orders/${id}`, {
      credentials: 'include',
    });
    return response.data;
  },
};

export default orderService;
