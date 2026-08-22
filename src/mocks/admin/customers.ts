import { Users, UserPlus, ShoppingCart, Wallet } from 'lucide-react'

export const customerStatsData = [
  { id: 1, label: 'TOTAL CUSTOMERS', value: '856', trend: '16.3%', isPositive: true, icon: Users, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'NEW CUSTOMERS', value: '128', trend: '18.6%', isPositive: true, icon: UserPlus, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'TOTAL ORDERS', value: '1,248', trend: '14.2%', isPositive: true, icon: ShoppingCart, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'TOTAL SPENT', value: '₹3,65,240', trend: '22.4%', isPositive: true, icon: Wallet, color: 'var(--admin-pink)', bg: '#FFF0F5' }
];

import customersJson from '../seed/admin/customers.json';

export const customersData = customersJson;
