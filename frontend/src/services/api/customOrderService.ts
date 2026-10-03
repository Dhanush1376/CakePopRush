import { apiClient } from '@/lib/api/client';

export interface CustomOrderDto {
  id: string;
  _id: string;
  orderId: string;
  customer: any;
  customerName: string;
  customerEmail: string;
  email: string;
  customerPhone?: string;
  phone?: string;
  initials: string;
  avatarColor: string;
  avatarBg: string;
  occasion: string;
  quantity: number;
  targetDate: string;
  targetDateRaw: string;
  createdDate: string;
  createdDateRaw: string;
  status: string;
  statusClass: string;
  designImg: string;
  designImage?: string;
  attachments?: Array<{ url: string; originalName?: string; mimeType?: string; size?: number }>;
  source: 'GENERAL' | 'PRODUCT';
  customOrderType: string;
  productId?: string;
  productSnapshot?: {
    productId?: string;
    name: string;
    slug?: string;
    image?: string;
    flavor?: string;
    categoryName?: string;
    category?: string;
    price?: number;
    description?: string;
  } | null;
  product?: {
    productId: string;
    name: string;
    slug?: string;
    image?: string;
    categoryName?: string;
    price?: number;
    description?: string;
  } | null;
  occasionDescription: string;
  customizationDetails?: Record<string, unknown>;
  statusHistory?: Array<{
    from: string;
    to: string;
    changedBy: string;
    changedAt: string;
    note?: string;
  }>;
  internalNotes?: Array<{
    author: string;
    authorName: string;
    text: string;
    createdAt: string;
  }>;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomOrderPayload {
  source?: 'GENERAL' | 'PRODUCT';
  customOrderType?: string;
  occasionDescription: string;
  targetDate: string;
  quantity: number | string;
  mobileNumber?: string;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  occasion?: string;
  budget?: string | number;
  designImage?: string;
  attachments?: Array<{ url: string; originalName?: string; mimeType?: string; size?: number }>;
  productId?: string;
  customizationDetails?: Record<string, unknown>;
}


export interface UpdateCustomOrderPayload {
  occasionDescription?: string;
  targetDate?: string;
  quantity?: number | string;
  mobileNumber?: string;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  occasion?: string;
  budget?: string | number;
  designImage?: string;
  attachments?: Array<{ url: string; originalName?: string; mimeType?: string; size?: number }>;
  customizationDetails?: Record<string, unknown>;
}

export const customOrderService = {
  create: async (data: CreateCustomOrderPayload) => {
    return apiClient.post<{ success: boolean; message: string; data: CustomOrderDto }>(
      '/api/v1/custom-orders',
      data
    );
  },

  getMyOrders: async () => {
    return apiClient.get<{ success: boolean; data: CustomOrderDto[] }>(
      '/api/v1/custom-orders/my-orders'
    );
  },

  getById: async (id: string) => {
    return apiClient.get<{ success: boolean; data: CustomOrderDto }>(
      `/api/v1/custom-orders/${id}`
    );
  },

  update: async (id: string, data: UpdateCustomOrderPayload) => {
    return apiClient.patch<{ success: boolean; message: string; data: CustomOrderDto }>(
      `/api/v1/custom-orders/${id}`,
      data
    );
  },

  // Admin APIs
  adminGetAll: async (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.set(k, String(v));
        }
      });
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ success: boolean; data: CustomOrderDto[] }>(
      `/api/v1/admin/custom-orders${qStr}`
    );
  },

  adminGetStats: async () => {
    return apiClient.get<{ success: boolean; data: any[] }>(
      '/api/v1/admin/custom-order-stats'
    );
  },

  adminGetById: async (id: string) => {
    return apiClient.get<{ success: boolean; data: CustomOrderDto }>(
      `/api/v1/admin/custom-orders/${id}`
    );
  },

  adminUpdateStatus: async (id: string, status: string, note?: string) => {
    return apiClient.patch<{ success: boolean; message: string; data: CustomOrderDto }>(
      `/api/v1/admin/custom-orders/${id}/status`,
      { status, note }
    );
  },

  adminUpdateNotes: async (id: string, notes: { adminNotes?: string; internalNote?: string }) => {
    return apiClient.patch<{ success: boolean; message: string; data: CustomOrderDto }>(
      `/api/v1/admin/custom-orders/${id}/notes`,
      notes
    );
  },

  adminDelete: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string; data: { id: string } }>(
      `/api/v1/admin/custom-orders/${id}`
    );
  },

  // ─── Form Builder Configuration APIs ───
  getConfig: async () => {
    return apiClient.get<{ success: boolean; data: CustomOrderConfigDto }>(
      '/api/v1/custom-orders/config'
    );
  },

  getAdminConfig: async () => {
    return apiClient.get<{ success: boolean; data: CustomOrderConfigDto }>(
      '/api/v1/admin/custom-orders/config'
    );
  },

  saveConfigDraft: async (content: any) => {
    return apiClient.post<{ success: boolean; data: CustomOrderConfigDto }>(
      '/api/v1/admin/custom-orders/config/draft',
      { content }
    );
  },

  updateConfig: async (content: any) => {
    return apiClient.post<{ success: boolean; data: CustomOrderConfigDto }>(
      '/api/v1/admin/custom-orders/config/publish',
      { content }
    );
  },
};

export interface CustomOrderFieldOption {
  value: string;
  label: string;
}

export interface CustomOrderFieldDto {
  id: string;
  type:
    | 'text'
    | 'textarea'
    | 'dropdown'
    | 'radio'
    | 'checkbox'
    | 'multiselect'
    | 'file'
    | 'image'
    | 'date'
    | 'number'
    | 'email'
    | 'phone'
    | 'whatsapp_chat';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: CustomOrderFieldOption[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  order: number;
}

export interface CustomOrderStepDto {
  id: string;
  title: string;
  description?: string;
  order: number;
  isHidden?: boolean;
  fields: CustomOrderFieldDto[];
}

export interface CustomOrderTypeDto {
  id: string;
  name: string;
  description: string;
  icon?: string;
  enabled: boolean;
  steps: CustomOrderStepDto[];
}

export interface CustomOrderConfigDto {
  version: number;
  status: 'draft' | 'published';
  types: CustomOrderTypeDto[];
  publishedAt?: string;
  publishedBy?: string;
}

