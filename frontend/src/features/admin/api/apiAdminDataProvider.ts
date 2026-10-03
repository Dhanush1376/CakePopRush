import { AdminCategory, AdminCoupon, AdminOrderDetail } from '@/mocks/runtimeStore';
import { apiClient } from '@/lib/api/client';
import { Briefcase, Clock, CheckCircle, Star, Users, UserPlus, ShoppingCart, Wallet, ShoppingBag, Package, Truck, Tag, TrendingDown, Heart } from 'lucide-react';
import { productStatsData } from '@/mocks/admin/products';

const emptyOrderStats = [
  { id: 1, label: 'TOTAL ORDERS', value: '0', trend: '0%', isPositive: true, comparison: 'real-time', icon: ShoppingBag, color: 'var(--admin-pink, #F20D6F)', bg: '#FFF0F5' },
  { id: 2, label: 'PENDING', value: '0', trend: '0%', isPositive: true, comparison: 'requires action', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'PROCESSING', value: '0', trend: '0%', isPositive: true, comparison: 'in kitchen/pack', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
  { id: 4, label: 'SHIPPED', value: '0', trend: '0%', isPositive: true, comparison: 'on the road', icon: Truck, color: 'var(--admin-cyan, #06B6D4)', bg: '#E0FAFC' },
  { id: 5, label: 'DELIVERED', value: '0', trend: '0%', isPositive: true, comparison: 'completed', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
];



// We define the interfaces inline since they weren't explicitly extracted like the Storefront ones.

export const apiAdminProductData = {
  getStats: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/product-stats', { credentials: 'include' });
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object') {
        return [
          { id: 1, label: 'TOTAL PRODUCTS', value: (raw.totalProducts ?? 128).toLocaleString(), trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink, #F20D6F)', bg: '#FFF0F5' },
          { id: 2, label: 'ACTIVE PRODUCTS', value: (raw.activeProducts ?? 112).toLocaleString(), trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
          { id: 3, label: 'OUT OF STOCK', value: (raw.outOfStockProducts ?? 4).toLocaleString(), trend: '3.2%', isPositive: false, comparison: 'vs last 7 days', icon: Tag, color: 'var(--admin-cyan, #06B6D4)', bg: '#E0FAFC' },
          { id: 4, label: 'LOW STOCK', value: (raw.lowStockProducts ?? 12).toLocaleString(), trend: '5.6%', isPositive: false, comparison: 'vs last 7 days', icon: TrendingDown, color: '#5C3317', bg: '#F5F5DC' },
          { id: 5, label: 'TOTAL VIEWS', value: (raw.totalViews ?? 24350).toLocaleString(), trend: '18.7%', isPositive: true, comparison: 'vs last 7 days', icon: Heart, color: 'var(--admin-pink, #F20D6F)', bg: '#FFF0F5' },
        ];
      }
      return productStatsData;
    } catch {
      return productStatsData;
    }
  },
  getProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/products', { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminOrderData = {
  getStats: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/order-stats', { credentials: 'include' });
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object') {
        return [
          { id: 1, label: 'TOTAL ORDERS', value: (raw.totalOrders ?? 0).toLocaleString(), trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink, #F20D6F)', bg: '#FFF0F5' },
          { id: 2, label: 'PENDING', value: (raw.pending ?? 0).toLocaleString(), trend: '8.2%', isPositive: true, comparison: 'requires action', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
          { id: 3, label: 'PROCESSING', value: (raw.processing ?? 0).toLocaleString(), trend: '16.3%', isPositive: true, comparison: 'in kitchen/pack', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
          { id: 4, label: 'SHIPPED', value: ((raw.confirmed ?? 0) + (raw.shipped ?? 0)).toLocaleString(), trend: '12.7%', isPositive: true, comparison: 'on the road', icon: Truck, color: 'var(--admin-cyan, #06B6D4)', bg: '#E0FAFC' },
          { id: 5, label: 'DELIVERED', value: (raw.delivered ?? 0).toLocaleString(), trend: '10.1%', isPositive: true, comparison: 'completed', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
        ];
      }
      return emptyOrderStats;
    } catch {
      return emptyOrderStats;
    }
  },
  getOrders: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/orders', { credentials: 'include' });
    return response.data?.orders || response.data || [];
  },
  getOrderById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: AdminOrderDetail }>(`/api/v1/admin/orders/${id}`, { credentials: 'include' });
    return response.data;
  },
  updateOrder: async (id: string, updates: Partial<AdminOrderDetail>) => {
    if (updates.status) {
      const response = await apiClient.patch<{ success: boolean; data: any }>(
        `/api/v1/admin/orders/${id}/status`,
        { status: updates.status, note: (updates as any).note, agentId: (updates as any).agentId },
        { credentials: 'include' }
      );
      return response.data;
    }
    const response = await apiClient.patch<{ success: boolean; data: AdminOrderDetail }>(`/api/v1/admin/orders/${id}`, updates, { credentials: 'include' });
    return response.data;
  },
  approveOrder: async (orderId: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/api/v1/admin/orders/${orderId}/approve`,
      {},
      { credentials: 'include' }
    );
    return response.data;
  },
  markOrderReady: async (orderId: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/api/v1/admin/orders/${orderId}/mark-ready`,
      {},
      { credentials: 'include' }
    );
    return response.data;
  },
  assignDeliveryAgent: async (orderId: string, agentId: string) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      `/api/v1/admin/orders/${orderId}/assign-agent`,
      { agentId },
      { credentials: 'include' }
    );
    return response.data;
  },
  getDeliveryAgents: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/delivery-agents', { credentials: 'include' });
    return response.data || [];
  },
  toggleDeliveryAgentStatus: async (agentId: string, isActive?: boolean) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(
      `/api/v1/admin/delivery-agents/${agentId}/status`,
      { isActive },
      { credentials: 'include' }
    );
    return response.data;
  },
  createDeliveryAgent: async (data: { name: string; email: string; phone?: string }) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/api/v1/admin/delivery-agents',
      data,
      { credentials: 'include' }
    );
    return response.data;
  },
  deleteDeliveryAgent: async (agentId: string) => {
    const response = await apiClient.delete<{ success: boolean; data: any }>(
      `/api/v1/admin/delivery-agents/${agentId}`,
      { credentials: 'include' }
    );
    return response.data;
  },
  getOrderStatuses: async () => {
    return ['Pending', 'Confirmed', 'Being Baked', 'Dispatched', 'Delivered', 'Cancelled'];
  },
};

export const apiAdminCategoryData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/category-stats', { credentials: 'include' });
    return response.data;
  },
  getCategories: async () => {
    const response = await apiClient.get<{ success: boolean; data: AdminCategory[] }>('/api/v1/admin/categories', { credentials: 'include' });
    return response.data;
  },
  updateCategory: async (id: string, updates: Partial<AdminCategory>) => {
    const response = await apiClient.patch<{ success: boolean; data: AdminCategory }>(`/api/v1/admin/categories/${id}`, updates, { credentials: 'include' });
    return response.data;
  },
  addCategory: async (category: Partial<AdminCategory>) => {
    const response = await apiClient.post<{ success: boolean; data: AdminCategory }>('/api/v1/admin/categories', category, { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminCouponData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/coupon-stats', { credentials: 'include' });
    return response.data;
  },
  getCoupons: async () => {
    const response = await apiClient.get<{ success: boolean; data: AdminCoupon[] }>('/api/v1/admin/coupons', { credentials: 'include' });
    return response.data;
  },
  deleteCoupon: async (id: number) => {
    await apiClient.delete(`/api/v1/admin/coupons/${id}`, { credentials: 'include' });
    return true; // If no error was thrown, it succeeded
  },
};

export const apiAdminCustomerData = {
  getStats: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/customers/stats', { credentials: 'include' });
      const raw = response.data || [];
      const iconMap: Record<number, any> = {
        1: Users,
        2: UserPlus,
        3: ShoppingCart,
        4: Wallet,
      };

      if (Array.isArray(raw)) {
        return raw.map((kpi, idx) => ({
          ...kpi,
          icon: iconMap[kpi.id || idx + 1] || Users,
        }));
      }
      return raw;
    } catch (err) {
      console.error('[API] Failed to fetch customer stats from database:', err);
      return [];
    }
  },

  getCustomers: async (params?: Record<string, any>) => {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '' && v !== 'all') {
            query.set(k, String(v));
          }
        });
      }
      const qStr = query.toString() ? `?${query.toString()}` : '';
      const response = await apiClient.get<{
        success: boolean;
        data: {
          customers: any[];
          total: number;
          totalCount: number;
          page: number;
          limit: number;
          totalPages: number;
        } | any[];
      }>(`/api/v1/admin/customers${qStr}`, { credentials: 'include' });

      const resData = response?.data;
      if (resData && typeof resData === 'object' && 'customers' in resData) {
        const arr = (resData as any).customers || [];
        (arr as any).total = (resData as any).total;
        (arr as any).totalCount = (resData as any).totalCount;
        (arr as any).page = (resData as any).page;
        (arr as any).limit = (resData as any).limit;
        (arr as any).totalPages = (resData as any).totalPages;
        return arr;
      }
      if (Array.isArray(resData)) {
        return resData;
      }
      return [];
    } catch (err) {
      console.error('[API] Failed to fetch customers from database:', err);
      return [];
    }
  },

  getCustomerById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/customers/${id}`, { credentials: 'include' });
    return response.data;
  },

  getCustomerOrders: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/api/v1/admin/customers/${id}/orders`, { credentials: 'include' });
    return response.data || [];
  },

  getCustomerCustomOrders: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/api/v1/admin/customers/${id}/custom-orders`, { credentials: 'include' });
    return response.data || [];
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(`/api/v1/admin/customers/${id}/status`, { status }, { credentials: 'include' });
    return response.data;
  },

  deleteCustomer: async (id: string, reason?: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/v1/admin/customers/${id}`, {
      body: reason ? JSON.stringify({ reason }) : undefined,
      credentials: 'include',
    });
    return response;
  },

  bulkUpdateStatus: async (ids: string[], status: string) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>('/api/v1/admin/customers/bulk-status', { ids, status }, { credentials: 'include' });
    return response.data;
  },

  bulkDelete: async (ids: string[]) => {
    const response = await apiClient.post<{ success: boolean; data: any }>('/api/v1/admin/customers/bulk-delete', { ids }, { credentials: 'include' });
    return response.data;
  },

  getCustomerNotes: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/api/v1/admin/customers/${id}/notes`, { credentials: 'include' });
    return response.data || [];
  },

  addCustomerNote: async (id: string, data: { content: string; tags?: string[]; isPinned?: boolean }) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/api/v1/admin/customers/${id}/notes`, data, { credentials: 'include' });
    return response.data;
  },

  updateCustomerNote: async (noteId: string, data: { content?: string; tags?: string[]; isPinned?: boolean }) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(`/api/v1/admin/customers/notes/${noteId}`, data, { credentials: 'include' });
    return response.data;
  },

  deleteCustomerNote: async (noteId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(`/api/v1/admin/customers/notes/${noteId}`, { credentials: 'include' });
    return response;
  },
};

// Real dynamic API custom orders provider (no mock fallbacks)
export const apiAdminCustomOrderData = {
  getStats: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/custom-order-stats', { credentials: 'include' });
      const raw = response.data || {};
      if (Array.isArray(raw)) {
        return raw;
      }
      return [
        { id: 1, label: 'TOTAL REQUESTS', value: String(raw.totalRequests ?? 0), trend: '', isPositive: true, comparison: 'all time', icon: Briefcase, color: 'var(--admin-pink)', bg: '#FFF0F5' },
        { id: 2, label: 'PENDING QUOTES', value: String(raw.pendingQuote ?? 0), trend: '', isPositive: false, comparison: 'awaiting review', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
        { id: 3, label: 'APPROVED', value: String(raw.approved ?? 0), trend: '', isPositive: true, comparison: 'active', icon: CheckCircle, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
        { id: 4, label: 'CLOSED', value: String(raw.closed ?? raw.completed ?? 0), trend: '', isPositive: true, comparison: 'completed', icon: Star, color: '#10B981', bg: '#D1FAE5' },
      ];
    } catch {
      return [
        { id: 1, label: 'TOTAL REQUESTS', value: '0', trend: '', isPositive: true, comparison: 'all time', icon: Briefcase, color: 'var(--admin-pink)', bg: '#FFF0F5' },
        { id: 2, label: 'PENDING QUOTES', value: '0', trend: '', isPositive: false, comparison: 'awaiting review', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
        { id: 3, label: 'APPROVED', value: '0', trend: '', isPositive: true, comparison: 'active', icon: CheckCircle, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
        { id: 4, label: 'CLOSED', value: '0', trend: '', isPositive: true, comparison: 'completed', icon: Star, color: '#10B981', bg: '#D1FAE5' },
      ];
    }
  },

  getCustomOrders: async (params?: Record<string, any>) => {
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            query.set(k, String(v));
          }
        });
      }
      const qStr = query.toString() ? `?${query.toString()}` : '';
      const response = await apiClient.get<{ success: boolean; data: any[] }>(`/api/v1/admin/custom-orders${qStr}`, { credentials: 'include' });
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (err) {
      console.error('[API] Failed to fetch custom orders from server:', err);
      return [];
    }
  },
  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/custom-orders/${id}`, { credentials: 'include' });
    return response.data;
  },
  updateStatus: async (id: string, status: string, note?: string) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(`/api/v1/admin/custom-orders/${id}/status`, { status, note }, { credentials: 'include' });
    return response.data;
  },
  updateNotes: async (id: string, notes: { adminNotes?: string; internalNote?: string }) => {
    const response = await apiClient.patch<{ success: boolean; data: any }>(`/api/v1/admin/custom-orders/${id}/notes`, notes, { credentials: 'include' });
    return response.data;
  },
  deleteCustomOrder: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; data: any }>(`/api/v1/admin/custom-orders/${id}`, { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminReviewData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/review-stats', { credentials: 'include' });
    return response.data;
  },
  getReviews: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/reviews', { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminNotificationData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/notification-stats', { credentials: 'include' });
    return response.data;
  },
  getNotifications: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/notifications', { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminUserData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/user-stats', { credentials: 'include' });
    return response.data;
  },
  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'all') query.set('role', params.role);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/users${qs ? `?${qs}` : ''}`, { credentials: 'include' });
    return response.data?.users ? response.data.users : response.data;
  },
  getUsersPaginated: async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'all') query.set('role', params.role);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/users${qs ? `?${qs}` : ''}`, { credentials: 'include' });
    return response.data;
  },
  updateRole: async (userId: string, role: string) => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/users/${userId}/role`,
      { role },
      { credentials: 'include' }
    );
    return response;
  },
  updateStatus: async (userId: string, status: 'active' | 'inactive') => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/users/${userId}/status`,
      { status },
      { credentials: 'include' }
    );
    return response;
  },
  removeAdmin: async (userId: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/users/${userId}`,
      { credentials: 'include' }
    );
    return response;
  },
  createInvite: async (email: string, role: string, permissionsSummary?: string) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
      '/api/v1/admin/invites',
      { email, role, permissionsSummary },
      { credentials: 'include' }
    );
    return response;
  },
  getPendingInvites: async () => {
    const response = await apiClient.get<{ success: boolean; data: { invites: any[]; totalCount: number } }>(
      '/api/v1/admin/invites/pending',
      { credentials: 'include' }
    );
    return response.data?.invites || [];
  },
  revokeInvite: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/admin/invites/${id}/revoke`,
      { credentials: 'include' }
    );
    return response;
  },
  resendInvite: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/invites/${id}/resend`,
      {},
      { credentials: 'include' }
    );
    return response;
  },
  getInviteHistory: async () => {
    const response = await apiClient.get<{ success: boolean; data: { invites: any[]; totalCount: number } }>(
      '/api/v1/admin/invites/history',
      { credentials: 'include' }
    );
    return response.data?.invites || [];
  },
};

export const apiAdminAnalyticsData = {
  getKpiStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/kpi-stats', { credentials: 'include' });
    return response.data;
  },
  getRevenueData: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/revenue', { credentials: 'include' });
    return response.data;
  },
  getSalesData: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/sales', { credentials: 'include' });
    return response.data;
  },
  getOrdersOverview: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/orders-overview', { credentials: 'include' });
    return response.data;
  },
  getTrafficSources: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/traffic-sources', { credentials: 'include' });
    return response.data;
  },
  getBestSellingProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/best-selling', { credentials: 'include' });
    return response.data;
  },
  getUserActivity: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/analytics/user-activity', { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminDashboardData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/stats', { credentials: 'include' });
    return response.data;
  },
  getSalesData: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/sales', { credentials: 'include' });
    return response.data;
  },
  getOrderStatusData: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/order-status', { credentials: 'include' });
    return response.data;
  },
  getTopSellingProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/top-selling', { credentials: 'include' });
    return response.data;
  },
  getRecentOrders: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/recent-orders', { credentials: 'include' });
    return response.data;
  },
  getLowStockProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/low-stock', { credentials: 'include' });
    return response.data;
  },
  getAdminUser: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/me', { credentials: 'include' });
    return response.data;
  },
  getNotifications: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/notifications', { credentials: 'include' });
    return response.data;
  },
};
