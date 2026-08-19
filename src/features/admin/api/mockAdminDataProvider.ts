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
import { orderStatsData, ordersData } from '@/mocks/admin/orders';
import { categoryStatsData, categoriesData } from '@/mocks/admin/categories';
import { couponStatsData, couponsData } from '@/mocks/admin/coupons';
import { customerStatsData, customersData } from '@/mocks/admin/customers';
import { customOrderStatsData, customOrdersData } from '@/mocks/admin/customOrders';
import { reviewStatsData, reviewsData } from '@/mocks/admin/reviews';
import { notificationStatsData, notificationsData } from '@/mocks/admin/notifications';
import { userStatsData, usersData } from '@/mocks/admin/users';
import { orderDetailData } from '@/mocks/admin/orderDetail';
import { MOCK_CUSTOMERS, MOCK_PRODUCTS } from '@/mocks/admin/newOrder';
import { 
  analyticsKpiData, revenueData, salesData as analyticsSalesData, 
  ordersOverviewData, trafficSourcesData, 
  bestSellingProductsData, userActivityData 
} from '@/mocks/admin/analytics';

export const adminProductData = {
  getStats: () => productStatsData,
  getProducts: () => productsData,
};

export const adminOrderData = {
  getStats: () => orderStatsData,
  getOrders: () => ordersData,
  getOrderById: (id: string) => {
    // In a real app, this would fetch the specific order.
    // For mock purposes, we return our detailed mock data but overwrite the ID.
    return { ...orderDetailData, id };
  },
  getOrderStatuses: () => ['Confirmed', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered'],
};

export const adminCategoryData = {
  getStats: () => categoryStatsData,
  getCategories: () => categoriesData,
};

export const adminCouponData = {
  getStats: () => couponStatsData,
  getCoupons: () => couponsData,
};

export const adminCustomerData = {
  getStats: () => customerStatsData,
  getCustomers: () => customersData,
};

export const adminCustomOrderData = {
  getStats: () => customOrderStatsData,
  getCustomOrders: () => customOrdersData,
};

export const adminReviewData = {
  getStats: () => reviewStatsData,
  getReviews: () => reviewsData,
};

export const adminNotificationData = {
  getStats: () => notificationStatsData,
  getNotifications: () => notificationsData,
};

export const adminUserData = {
  getStats: () => userStatsData,
  getUsers: () => usersData,
};

export const adminAnalyticsData = {
  getKpiStats: () => analyticsKpiData,
  getRevenueData: () => revenueData,
  getSalesData: () => analyticsSalesData,
  getOrdersOverview: () => ordersOverviewData,
  getTrafficSources: () => trafficSourcesData,
  getBestSellingProducts: () => bestSellingProductsData,
  getUserActivity: () => userActivityData,
};


export const adminNewOrderData = {
  getCustomers: () => MOCK_CUSTOMERS,
  getProducts: () => MOCK_PRODUCTS,
};

export const adminDashboardData = {
  getStats: () => adminStats,
  getSalesData: () => dashboardSalesData,
  getOrderStatusData: () => orderStatusData,
  getTopSellingProducts: () => topSellingProducts,
  getRecentOrders: () => recentOrders,
  getLowStockProducts: () => lowStockProducts,
  getAdminUser: () => adminUser,
  getNotifications: () => notifications,
};
