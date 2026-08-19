import { ShoppingBag, Package, Tag, TrendingDown, Heart } from 'lucide-react'

export const productStatsData = [
  { id: 1, label: 'TOTAL PRODUCTS', value: '128', trend: '12.4%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE PRODUCTS', value: '112', trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'OUT OF STOCK', value: '4', trend: '3.2%', isPositive: false, comparison: 'vs last 7 days', icon: Tag, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'LOW STOCK', value: '12', trend: '5.6%', isPositive: false, comparison: 'vs last 7 days', icon: TrendingDown, color: '#5C3317', bg: '#F5F5DC' },
  { id: 5, label: 'TOTAL VIEWS', value: '24,350', trend: '18.7%', isPositive: true, comparison: 'vs last 7 days', icon: Heart, color: 'var(--admin-pink)', bg: '#FFF0F5' },
];

export const productsData = [
  { sku: 'CPR-001', name: 'Strawberry Bliss Pops', image: '/images/Products/mini valentine cake.jpeg', category: 'Cake Pops', price: '₹499', stock: 48, stockState: 'In Stock', status: 'Active', sales: 512, views: '2,350' },
  { sku: 'CPR-002', name: 'Chocolate Crunch Pops', image: '/images/Products/Dark choclate cakepops.jpeg', category: 'Cake Pops', price: '₹499', stock: 36, stockState: 'In Stock', status: 'Active', sales: 498, views: '2,120' },
  { sku: 'CPR-003', name: 'Cute Chick Pops', image: '/images/Products/vanilla mango cupcakes.jpeg', category: 'Cupcakes', price: '₹449', stock: 8, stockState: 'Low Stock', status: 'Active', sales: 423, views: '1,890' },
  { sku: 'CPR-004', name: 'Lavender Love Pops', image: '/images/Products/White choclate cakepops.jpeg', category: 'Cake Pops', price: '₹549', stock: 0, stockState: 'Out of Stock', status: 'Inactive', sales: 215, views: '1,450' },
  { sku: 'CPR-005', name: 'Red Velvet Pops', image: '/images/Products/Red velvet cookies.jpeg', category: 'Cookies', price: '₹499', stock: 65, stockState: 'In Stock', status: 'Active', sales: 678, views: '3,100' },
  { sku: 'CPR-006', name: 'Oreo Crunch Pops', image: '/images/Products/Oreo pops.jpeg', category: 'Brownies', price: '₹549', stock: 12, stockState: 'Low Stock', status: 'Active', sales: 345, views: '1,780' },
  { sku: 'CPR-007', name: 'Birthday Sprinkle Pops', image: '/images/Products/asorted flavours of cookies.jpeg', category: 'Desserts', price: '₹599', stock: 42, stockState: 'In Stock', status: 'Active', sales: 890, views: '4,200' },
];
