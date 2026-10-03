import { ShoppingBag, Package, Tag, TrendingDown, Heart } from 'lucide-react'

export const productStatsData = [
  { id: 1, label: 'TOTAL PRODUCTS', value: '128', trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE PRODUCTS', value: '112', trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'OUT OF STOCK', value: '4', trend: '3.2%', isPositive: false, comparison: 'vs last 7 days', icon: Tag, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'LOW STOCK', value: '12', trend: '5.6%', isPositive: false, comparison: 'vs last 7 days', icon: TrendingDown, color: '#5C3317', bg: '#F5F5DC' },
  { id: 5, label: 'TOTAL VIEWS', value: '24,350', trend: '18.7%', isPositive: true, comparison: 'vs last 7 days', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
];

import productsJson from '../seed/admin/products.json';

export const productsData = productsJson;
