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

export const salesData = [
  { date: "May 18", value: 15000 },
  { date: "May 19", value: 43000 },
  { date: "May 20", value: 75000 },
  { date: "May 21", value: 50000 },
  { date: "May 22", value: 86000 },
  { date: "May 23", value: 50000 },
  { date: "May 24", value: 68000 },
];

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

export const recentOrders = [
  { id: "#CPR-1254", customer: "Neha Sharma", amount: "₹1,260", status: "Pending" },
  { id: "#CPR-1253", customer: "Riya Patel", amount: "₹980", status: "Processing" },
  { id: "#CPR-1252", customer: "Ankit Verma", amount: "₹1,450", status: "Shipped" },
  { id: "#CPR-1251", customer: "Pooja Mehta", amount: "₹2,350", status: "Delivered" },
  { id: "#CPR-1250", customer: "Karan Singh", amount: "₹890", status: "Pending" },
];

export const lowStockProducts = mockProducts.slice(10, 14).map((p, i) => ({
  id: p.id,
  name: p.name,
  image: p.images[0].url,
  stock: [12, 15, 8, 10][i] || 5,
}));

export const adminUser = {
  name: "Admin User",
  role: "Super Admin",
  avatar: null, 
};

export const notifications = {
  count: 5,
};
