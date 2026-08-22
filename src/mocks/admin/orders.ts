import { ShoppingBag, Clock, Package, Truck, CheckCircle } from 'lucide-react'

export const orderStatsData = [
  { id: 1, label: 'TOTAL ORDERS', value: '1,248', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'PENDING', value: '312', trend: '8.2%', isPositive: true, comparison: 'vs last 7 days', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'PROCESSING', value: '456', trend: '16.3%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
  { id: 4, label: 'SHIPPED', value: '312', trend: '12.7%', isPositive: true, comparison: 'vs last 7 days', icon: Truck, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 5, label: 'DELIVERED', value: '168', trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
];

import ordersJson from '../seed/admin/orders.json';

export const ordersData = ordersJson;
