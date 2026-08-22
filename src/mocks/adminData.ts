import { getBestSellingProducts, mockProducts } from './products';

export const adminStats = {
  totalOrders: {
    value: "1,248",
    growth: "+18.6%",
    isPositive: true,
    comparison: "vs last 7 days",
  },
  totalRevenue: {
    value: "₹3,65,240",
    growth: "+22.4%",
    isPositive: true,
    comparison: "vs last 7 days",
  },
  totalCustomers: {
    value: "856",
    growth: "+16.3%",
    isPositive: true,
    comparison: "vs last 7 days",
  },
  wishlistAdds: {
    value: "2,350",
    growth: "+14.2%",
    isPositive: true,
    comparison: "vs last 7 days",
  }
};

import dashboardJson from './seed/admin/dashboard.json';

export const salesData = dashboardJson.salesData;

export const orderStatusData = [
  { label: "Pending", value: 312, percentage: 25, color: "var(--admin-pink)" },
  { label: "Processing", value: 456, percentage: 36, color: "var(--admin-yellow)" },
  { label: "Shipped", value: 312, percentage: 25, color: "var(--admin-cyan)" },
  { label: "Delivered", value: 168, percentage: 14, color: "var(--admin-brown)" },
];

export const topSellingProducts = getBestSellingProducts(4).map((p, i) => ({
  id: p.id,
  name: p.name,
  image: p.images[0].url,
  sold: [512, 498, 423, 310][i] || 150,
}));

export const recentOrders = dashboardJson.recentOrders;

export const lowStockProducts = mockProducts.slice(10, 14).map((p, i) => ({
  id: p.id,
  name: p.name,
  image: p.images[0].url,
  stock: [12, 15, 8, 10][i] || 5,
}));

export const adminUser = dashboardJson.adminUser;

export const notifications = dashboardJson.notifications;
