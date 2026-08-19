import { Package, Lollipop, Cake, Cookie, Box, Dessert, CakeSlice } from 'lucide-react'

export const categoryStatsData = [
  { id: '1', label: 'TOTAL CATEGORIES', value: '24', trend: '14.3%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: '2', label: 'ACTIVE CATEGORIES', value: '20', trend: '11.5%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: '3', label: 'INACTIVE CATEGORIES', value: '4', trend: '20.0%', isPositive: false, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: '4', label: 'PRODUCTS IN CATEGORIES', value: '128', trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: 'var(--admin-pink)', bg: '#FFF0F5' },
];

export const categoriesData = [
  { id: '1', name: 'All Items', description: 'Browse all sweet treats.', products: 128, status: 'Active', created: 'May 10, 2025', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: '2', name: 'Cake Pops', description: 'Delicious and fun cake on a stick.', products: 42, status: 'Active', created: 'May 08, 2025', icon: Lollipop, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: '3', name: 'Cupcakes', description: 'Classic miniature cakes with rich frosting.', products: 24, status: 'Active', created: 'May 05, 2025', icon: Cake, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: '4', name: 'Cookies', description: 'Freshly baked, chewy and crispy cookies.', products: 18, status: 'Active', created: 'May 02, 2025', icon: Cookie, color: '#5C3317', bg: '#F5F5DC' },
  { id: '5', name: 'Brownies', description: 'Fudgy, chocolatey goodness.', products: 12, status: 'Active', created: 'Apr 28, 2025', icon: Box, color: '#9333EA', bg: '#F3E8FF' },
  { id: '6', name: 'Desserts', description: 'Assorted truffles and other sweet treats.', products: 16, status: 'Active', created: 'Apr 25, 2025', icon: Dessert, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: '7', name: 'Cakes', description: 'Beautiful cakes for every occasion.', products: 14, status: 'Active', created: 'Apr 20, 2025', icon: CakeSlice, color: '#F59E0B', bg: '#FFF8E1' }
];
