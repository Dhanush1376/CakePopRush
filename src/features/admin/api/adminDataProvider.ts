import { getProviderMode } from '@/lib/providerConfig';

import * as mockAdminProviders from './mockAdminDataProvider';
import * as apiAdminProviders from './apiAdminDataProvider';

const mode = getProviderMode();

export const adminProductData = mode === 'api' ? apiAdminProviders.apiAdminProductData : mockAdminProviders.adminProductData;
export const adminOrderData = mode === 'api' ? apiAdminProviders.apiAdminOrderData : mockAdminProviders.adminOrderData;
export const adminCategoryData = mode === 'api' ? apiAdminProviders.apiAdminCategoryData : mockAdminProviders.adminCategoryData;
export const adminCouponData = mode === 'api' ? apiAdminProviders.apiAdminCouponData : mockAdminProviders.adminCouponData;
export const adminCustomerData = mode === 'api' ? apiAdminProviders.apiAdminCustomerData : mockAdminProviders.adminCustomerData;
export const adminCustomOrderData = mode === 'api' ? apiAdminProviders.apiAdminCustomOrderData : mockAdminProviders.adminCustomOrderData;
export const adminReviewData = mode === 'api' ? apiAdminProviders.apiAdminReviewData : mockAdminProviders.adminReviewData;
export const adminNotificationData = mode === 'api' ? apiAdminProviders.apiAdminNotificationData : mockAdminProviders.adminNotificationData;
export const adminUserData = mode === 'api' ? apiAdminProviders.apiAdminUserData : mockAdminProviders.adminUserData;
export const adminAnalyticsData = mode === 'api' ? apiAdminProviders.apiAdminAnalyticsData : mockAdminProviders.adminAnalyticsData;
export const adminNewOrderData = mode === 'api' ? apiAdminProviders.apiAdminNewOrderData : mockAdminProviders.adminNewOrderData;
export const adminDashboardData = mode === 'api' ? apiAdminProviders.apiAdminDashboardData : mockAdminProviders.adminDashboardData;
