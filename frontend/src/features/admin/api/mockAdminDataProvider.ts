import {
  adminStats,
  salesData as dashboardSalesData,
  orderStatusData,
  topSellingProducts,
  recentOrders,
  lowStockProducts,
  adminUser,
  notifications
} from '@/mocks/adminData';
import { productStatsData, productsData } from '@/mocks/admin/products';
import { categoryStatsData, categoriesData } from '@/mocks/admin/categories';
import { couponStatsData, couponsData } from '@/mocks/admin/coupons';
import { reviewStatsData, reviewsData } from '@/mocks/admin/reviews';
import { notificationStatsData, notificationsData } from '@/mocks/admin/notifications';
import { userStatsData, usersData } from '@/mocks/admin/users';
import { MOCK_CUSTOMERS, MOCK_PRODUCTS } from '@/mocks/admin/newOrder';
import { 
  analyticsKpiData, revenueData, salesData as analyticsSalesData, 
  ordersOverviewData, trafficSourcesData, 
  bestSellingProductsData, userActivityData 
} from '@/mocks/admin/analytics';
import { apiAdminCustomerData, apiAdminOrderData, apiAdminDashboardData } from './apiAdminDataProvider';

import { simulateAsync } from '@/lib/simulateAsync';
import { runtimeStore, AdminCategory, AdminCoupon, AdminOrderDetail } from '@/mocks/runtimeStore';

export const adminProductData = {
  getStats: () => simulateAsync(productStatsData),
  getProducts: () => simulateAsync(productsData),
};

// Orders always use real MongoDB-backed API provider
export const adminOrderData = apiAdminOrderData;

export const adminCategoryData = {
  getStats: () => simulateAsync(categoryStatsData),
  getCategories: () => simulateAsync(runtimeStore.getCategories()),
  updateCategory: (id: string, updates: Partial<AdminCategory>) => simulateAsync(runtimeStore.updateCategory(id, updates)),
  addCategory: (category: Partial<AdminCategory>) => simulateAsync(runtimeStore.addCategory(category)),
};

export const adminCouponData = {
  getStats: () => simulateAsync(couponStatsData),
  getCoupons: () => simulateAsync(runtimeStore.getCoupons()),
  deleteCoupon: (id: number) => simulateAsync(runtimeStore.deleteCoupon(id)),
};

// Customers page always uses real dynamic database data from MongoDB
export const adminCustomerData = apiAdminCustomerData;

export const adminCustomOrderData = {
  getStats: () => simulateAsync({
    totalRequests: 0,
    pendingReview: 0,
    approved: 0,
    avgResponseTime: '0 hrs',
  }),
  getCustomOrders: () => simulateAsync([]),
};

export const adminReviewData = {
  getStats: () => simulateAsync(reviewStatsData),
  getReviews: () => simulateAsync(reviewsData),
};

export const adminNotificationData = {
  getStats: () => simulateAsync(notificationStatsData),
  getNotifications: () => simulateAsync(notificationsData),
};

export const adminUserData = {
  getStats: () => simulateAsync(userStatsData),
  getUsers: () => simulateAsync(usersData),
};

export const adminAnalyticsData = {
  getKpiStats: () => simulateAsync(analyticsKpiData),
  getRevenueData: () => simulateAsync(revenueData),
  getSalesData: () => simulateAsync(analyticsSalesData),
  getOrdersOverview: () => simulateAsync(ordersOverviewData),
  getTrafficSources: () => simulateAsync(trafficSourcesData),
  getBestSellingProducts: () => simulateAsync(bestSellingProductsData),
  getUserActivity: () => simulateAsync(userActivityData),
};


export const adminDashboardData = {
  getStats: () => simulateAsync(adminStats),
  getSalesData: () => simulateAsync(dashboardSalesData),
  getOrderStatusData: () => simulateAsync(orderStatusData),
  getTopSellingProducts: () => simulateAsync(topSellingProducts),
  getRecentOrders: () => apiAdminDashboardData.getRecentOrders(),
  getLowStockProducts: () => simulateAsync(lowStockProducts),
  getAdminUser: () => simulateAsync(adminUser),
  getNotifications: () => simulateAsync(notifications),
};

// cache buster 2
