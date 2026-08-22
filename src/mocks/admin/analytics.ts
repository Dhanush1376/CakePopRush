import { ShoppingBag, ShoppingCart, Users, Heart, Eye, UserPlus, Tag } from 'lucide-react'

export const analyticsKpiData = [
  { id: 1, label: 'TOTAL REVENUE', value: '₹3,65,240', trend: '22.4%', isPositive: true, icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5', chart: [30, 45, 40, 60, 55, 80, 100] },
  { id: 2, label: 'TOTAL ORDERS', value: '1,248', trend: '18.6%', isPositive: true, icon: ShoppingCart, color: '#F59E0B', bg: '#FFF8E1', chart: [20, 35, 30, 50, 45, 70, 90] },
  { id: 3, label: 'TOTAL CUSTOMERS', value: '856', trend: '16.3%', isPositive: true, icon: Users, color: 'var(--admin-cyan)', bg: '#E0FAFC', chart: [10, 25, 20, 40, 35, 60, 80] },
  { id: 4, label: 'WISHLIST ADDS', value: '2,350', trend: '14.2%', isPositive: true, icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5', chart: [15, 30, 25, 45, 40, 65, 85] },
  { id: 5, label: 'TOTAL VIEWS', value: '24,350', trend: '12.7%', isPositive: true, icon: Eye, color: '#5C3317', bg: '#F5F5DC', chart: [5, 20, 15, 35, 30, 55, 75] },
];

import analyticsJson from '../seed/admin/analytics.json';

export const revenueData = analyticsJson.revenueData;
export const salesData = analyticsJson.salesData;
export const ordersOverviewData = analyticsJson.ordersOverviewData;
export const trafficSourcesData = analyticsJson.trafficSourcesData;
export const bestSellingProductsData = analyticsJson.bestSellingProductsData;

export const userActivityData = [
  { id: 1, label: 'New Customers', sub: 'Joined this week', value: '128', trend: '18.6%', icon: UserPlus, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'Orders Placed', sub: 'This week', value: '1,248', trend: '18.6%', icon: ShoppingCart, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'Page Views', sub: 'This week', value: '24,350', trend: '12.7%', icon: Eye, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'Wishlist Adds', sub: 'This week', value: '2,350', trend: '14.2%', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'Coupons Used', sub: 'This week', value: '532', trend: '16.3%', icon: Tag, color: '#5C3317', bg: '#F5F5DC' },
];
