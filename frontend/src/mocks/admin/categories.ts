import { Package, Lollipop, Cake, Cookie, Box, Dessert, CakeSlice } from 'lucide-react'

export const categoryStatsData = [
  { id: '1', label: 'TOTAL CATEGORIES', value: '24', trend: '14.3%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: '2', label: 'ACTIVE CATEGORIES', value: '20', trend: '11.5%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: '3', label: 'INACTIVE CATEGORIES', value: '4', trend: '20.0%', isPositive: false, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: '4', label: 'PRODUCTS IN CATEGORIES', value: '128', trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-pink)', bg: '#FFF0F5' },
];

import categoriesJson from '../seed/admin/categories.json';

const iconMap: Record<string, any> = {
  Package, Lollipop, Cake, Cookie, Box, Dessert, CakeSlice
};

export const categoriesData = categoriesJson.map((cat: any) => ({
  ...cat,
  icon: iconMap[cat.icon] || Package
}));
