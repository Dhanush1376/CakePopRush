import { getProviderMode } from '@/lib/providerConfig';

import * as mockAdminProviders from './mockAdminDataProvider';
import * as apiAdminProviders from './apiAdminDataProvider';

const mode = getProviderMode();

export const adminProductData = mode === 'api' ? apiAdminProviders.apiAdminProductData : mockAdminProviders.adminProductData;
export const adminOrderData = apiAdminProviders.apiAdminOrderData;
export const adminCategoryData = mode === 'api' ? apiAdminProviders.apiAdminCategoryData : mockAdminProviders.adminCategoryData;
export const adminCouponData = mode === 'api' ? apiAdminProviders.apiAdminCouponData : mockAdminProviders.adminCouponData;
// Customers, Custom Orders, and Orders always use real dynamic API provider backed by MongoDB
export const adminCustomerData = apiAdminProviders.apiAdminCustomerData;
export const adminCustomOrderData = apiAdminProviders.apiAdminCustomOrderData;

export const adminReviewData = mode === 'api' ? apiAdminProviders.apiAdminReviewData : mockAdminProviders.adminReviewData;
export const adminNotificationData = mode === 'api' ? apiAdminProviders.apiAdminNotificationData : mockAdminProviders.adminNotificationData;
export const adminUserData = apiAdminProviders.apiAdminUserData;
export const adminAnalyticsData = mode === 'api' ? apiAdminProviders.apiAdminAnalyticsData : mockAdminProviders.adminAnalyticsData;
export const adminDashboardData = mode === 'api' ? apiAdminProviders.apiAdminDashboardData : mockAdminProviders.adminDashboardData;
