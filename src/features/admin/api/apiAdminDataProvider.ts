import { AdminCategory, AdminCoupon, AdminOrderDetail } from '@/mocks/runtimeStore';
import { apiClient } from '@/lib/api/client';

// We define the interfaces inline since they weren't explicitly extracted like the Storefront ones.

export const apiAdminProductData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/product-stats', { credentials: 'include' });
    return response.data;
  },
  getProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/products', { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminOrderData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/order-stats', { credentials: 'include' });
    return response.data;
  },
  getOrders: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/orders', { credentials: 'include' });
    return response.data;
  },
  getOrderById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: AdminOrderDetail }>(`/api/v1/admin/orders/${id}`, { credentials: 'include' });
    return response.data;
  },
  updateOrder: async (id: string, updates: Partial<AdminOrderDetail>) => {
    const response = await apiClient.patch<{ success: boolean; data: AdminOrderDetail }>(`/api/v1/admin/orders/${id}`, updates, { credentials: 'include' });
    return response.data;
  },
  getOrderStatuses: async () => {
    // Currently hardcoded in mock. When backend has dynamic statuses, it would be an endpoint.
    return ['Confirmed', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered'];
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
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/customer-stats', { credentials: 'include' });
    return response.data;
  },
  getCustomers: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/customers', { credentials: 'include' });
    return response.data;
  },
};

export const apiAdminCustomOrderData = {
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/custom-order-stats', { credentials: 'include' });
    return response.data;
  },
  getCustomOrders: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/custom-orders', { credentials: 'include' });
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
  getUsers: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/users', { credentials: 'include' });
    return response.data;
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

export const apiAdminNewOrderData = {
  getCustomers: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/new-order/customers', { credentials: 'include' });
    return response.data;
  },
  getProducts: async () => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/new-order/products', { credentials: 'include' });
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
