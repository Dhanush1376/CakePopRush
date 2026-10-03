import fs from 'fs';
import path from 'path';

// Helper to stringify while replacing React components (Lucide icons) with their string names
function replacer(key: string, value: any) {
  // Try to identify Lucide icons (usually they are functional components)
  if (key === 'icon') {
    if (typeof value === 'function') {
      return value.name || value.displayName || 'Icon';
    }
    if (typeof value === 'object' && value !== null) {
      if (value.render && value.render.name) {
        return value.render.name;
      }
      return value.name || value.displayName || 'Icon';
    }
    return value;
  }
  return value;
}

// 1. Storefront Data
import { mockProducts, mockCategories } from './src/mocks/products';
import { mockReviews } from './src/mocks/reviews';
import { MOCK_ORDERS } from './src/features/orders/data/mockOrders';
import { MOCK_ORDER_DETAILS } from './src/features/orders/data/mockOrderDetails';

fs.writeFileSync('./src/mocks/seed/storefront/products.json', JSON.stringify(mockProducts, replacer, 2));
fs.writeFileSync('./src/mocks/seed/storefront/categories.json', JSON.stringify(mockCategories, replacer, 2));
fs.writeFileSync('./src/mocks/seed/storefront/reviews.json', JSON.stringify(mockReviews, replacer, 2));
fs.writeFileSync('./src/mocks/seed/storefront/orders.json', JSON.stringify(MOCK_ORDERS, replacer, 2));
fs.writeFileSync('./src/mocks/seed/storefront/orderDetails.json', JSON.stringify(MOCK_ORDER_DETAILS, replacer, 2));

console.log('Storefront data extracted');

// 2. Admin Data
import { productsData } from './src/mocks/admin/products';
import { ordersData } from './src/mocks/admin/orders';
import { orderDetailData } from './src/mocks/admin/orderDetail';
import { categoriesData } from './src/mocks/admin/categories';
import { customersData } from './src/mocks/admin/customers';
import { usersData } from './src/mocks/admin/users';
import { couponsData } from './src/mocks/admin/coupons';
import { reviewsData } from './src/mocks/admin/reviews';
import { notificationsData } from './src/mocks/admin/notifications';
import { customOrdersData } from './src/mocks/admin/customOrders';
import { MOCK_CUSTOMERS as newOrderCustomers, MOCK_PRODUCTS as newOrderProducts } from './src/mocks/admin/newOrder';
import { revenueData, salesData as analyticsSalesData, ordersOverviewData, trafficSourcesData, bestSellingProductsData } from './src/mocks/admin/analytics';
import { salesData as dashboardSalesData, recentOrders, adminUser, notifications as dashboardNotifications } from './src/mocks/adminData';

fs.writeFileSync('./src/mocks/seed/admin/products.json', JSON.stringify(productsData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/orders.json', JSON.stringify(ordersData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/orderDetail.json', JSON.stringify(orderDetailData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/categories.json', JSON.stringify(categoriesData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/customers.json', JSON.stringify(customersData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/users.json', JSON.stringify(usersData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/coupons.json', JSON.stringify(couponsData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/reviews.json', JSON.stringify(reviewsData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/notifications.json', JSON.stringify(notificationsData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/customOrders.json', JSON.stringify(customOrdersData, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/newOrderLookups.json', JSON.stringify({ customers: newOrderCustomers, products: newOrderProducts }, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/analytics.json', JSON.stringify({ revenueData, salesData: analyticsSalesData, ordersOverviewData, trafficSourcesData, bestSellingProductsData }, replacer, 2));
fs.writeFileSync('./src/mocks/seed/admin/dashboard.json', JSON.stringify({ salesData: dashboardSalesData, recentOrders, adminUser, notifications: dashboardNotifications }, replacer, 2));

console.log('Admin data extracted');
