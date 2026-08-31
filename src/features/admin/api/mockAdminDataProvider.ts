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

import { simulateAsync } from '@/lib/simulateAsync';
import { runtimeStore, AdminCategory, AdminCoupon, AdminOrderDetail } from '@/mocks/runtimeStore';

export const adminProductData = {
  getStats: () => simulateAsync(productStatsData),
  getProducts: () => simulateAsync(productsData),
};

export const adminOrderData = {
  getStats: () => simulateAsync(orderStatsData),
  getOrders: () => simulateAsync(ordersData.map((o: any, i: number) => ({ ...o, productName: o.productName || "Mapped Name " + i, productImage: o.productImage || "/images/placeholder.jpg" }))),
  getOrderById: (id: string) => simulateAsync(runtimeStore.getOrderDetail(id)),
  updateOrder: (id: string, updates: Partial<AdminOrderDetail>) => simulateAsync(runtimeStore.updateOrderDetail(id, updates)),
  getOrderStatuses: () => simulateAsync(['Confirmed', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered']),
};

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

export const adminCustomerData = {
  getStats: () => simulateAsync(customerStatsData),
  getCustomers: () => simulateAsync(customersData),
};

export const adminCustomOrderData = {
  getStats: () => simulateAsync(customOrderStatsData),
  getCustomOrders: () => simulateAsync(customOrdersData),
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


export const adminNewOrderData = {
  getCustomers: () => simulateAsync(MOCK_CUSTOMERS),
  getProducts: () => simulateAsync(MOCK_PRODUCTS),
};

export const adminDashboardData = {
  getStats: () => simulateAsync(adminStats),
  getSalesData: () => simulateAsync(dashboardSalesData),
  getOrderStatusData: () => simulateAsync(orderStatusData),
  getTopSellingProducts: () => simulateAsync(topSellingProducts),
  getRecentOrders: () => simulateAsync(recentOrders),
  getLowStockProducts: () => simulateAsync(lowStockProducts),
  getAdminUser: () => simulateAsync(adminUser),
  getNotifications: () => simulateAsync(notifications),
};

// cache buster 2
