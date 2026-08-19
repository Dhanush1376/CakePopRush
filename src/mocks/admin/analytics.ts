import { ShoppingBag, ShoppingCart, Users, Heart, Eye, UserPlus, Tag } from 'lucide-react'

export const analyticsKpiData = [
  { id: 1, label: 'TOTAL REVENUE', value: '₹3,65,240', trend: '22.4%', isPositive: true, icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5', chart: [30, 45, 40, 60, 55, 80, 100] },
  { id: 2, label: 'TOTAL ORDERS', value: '1,248', trend: '18.6%', isPositive: true, icon: ShoppingCart, color: '#F59E0B', bg: '#FFF8E1', chart: [20, 35, 30, 50, 45, 70, 90] },
  { id: 3, label: 'TOTAL CUSTOMERS', value: '856', trend: '16.3%', isPositive: true, icon: Users, color: 'var(--admin-cyan)', bg: '#E0FAFC', chart: [10, 25, 20, 40, 35, 60, 80] },
  { id: 4, label: 'WISHLIST ADDS', value: '2,350', trend: '14.2%', isPositive: true, icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5', chart: [15, 30, 25, 45, 40, 65, 85] },
  { id: 5, label: 'TOTAL VIEWS', value: '24,350', trend: '12.7%', isPositive: true, icon: Eye, color: '#5C3317', bg: '#F5F5DC', chart: [5, 20, 15, 35, 30, 55, 75] },
];

export const revenueData = [18000, 45000, 80000, 55000, 100000, 55000, 80000];
export const salesData = [18000, 42000, 75000, 50000, 86000, 49000, 65000];

export const ordersOverviewData = [
  { label: 'Pending', value: 312, percentage: 25, color: 'var(--admin-pink)' },
  { label: 'Processing', value: 456, percentage: 36, color: '#F59E0B' },
  { label: 'Shipped', value: 312, percentage: 25, color: 'var(--admin-cyan)' },
  { label: 'Delivered', value: 168, percentage: 14, color: '#5C3317' },
];

export const trafficSourcesData = [
  { label: 'Direct', value: 8450, percentage: 34.7, color: 'var(--admin-pink)' },
  { label: 'Organic Search', value: 7250, percentage: 29.8, color: '#F59E0B' },
  { label: 'Social Media', value: 5120, percentage: 21.0, color: 'var(--admin-cyan)' },
  { label: 'Referral', value: 3530, percentage: 14.5, color: '#5C3317' },
];

export const bestSellingProductsData = [
  { id: 1, name: 'Strawberry Bliss Pops', sales: 512, img: '/images/Products/mini valentine cake.jpeg' },
  { id: 2, name: 'Chocolate Crunch Pops', sales: 498, img: '/images/Products/Dark choclate cakepops.jpeg' },
  { id: 3, name: 'Cute Chick Pops', sales: 423, img: '/images/Products/vanilla mango cupcakes.jpeg' },
  { id: 4, name: 'Lavender Love Pops', sales: 310, img: '/images/Products/White choclate cakepops.jpeg' },
  { id: 5, name: 'Red Velvet Pops', sales: 298, img: '/images/Products/Red velvet cookies.jpeg' },
];

export const userActivityData = [
  { id: 1, label: 'New Customers', sub: 'Joined this week', value: '128', trend: '18.6%', icon: UserPlus, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'Orders Placed', sub: 'This week', value: '1,248', trend: '18.6%', icon: ShoppingCart, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'Page Views', sub: 'This week', value: '24,350', trend: '12.7%', icon: Eye, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'Wishlist Adds', sub: 'This week', value: '2,350', trend: '14.2%', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'Coupons Used', sub: 'This week', value: '532', trend: '16.3%', icon: Tag, color: '#5C3317', bg: '#F5F5DC' },
];
