import { ShoppingBag, Clock, Package, Truck, CheckCircle } from 'lucide-react'

export const orderStatsData = [
  { id: 1, label: 'TOTAL ORDERS', value: '1,248', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: ShoppingBag, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'PENDING', value: '312', trend: '8.2%', isPositive: true, comparison: 'vs last 7 days', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'PROCESSING', value: '456', trend: '16.3%', isPositive: true, comparison: 'vs last 7 days', icon: Package, color: '#0284C7', bg: '#E0F2FE' },
  { id: 4, label: 'SHIPPED', value: '312', trend: '12.7%', isPositive: true, comparison: 'vs last 7 days', icon: Truck, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 5, label: 'DELIVERED', value: '168', trend: '10.1%', isPositive: true, comparison: 'vs last 7 days', icon: CheckCircle, color: '#5C3317', bg: '#F5F5DC' },
];

export const ordersData = [
  { id: '#CPR-1254', customer: 'Neha Sharma', email: 'nehasharma@email.com', date: 'May 24, 2025', time: '10:30 AM', amount: '₹1,260', items: '3 items', method: 'Online', paymentStatus: 'Paid', status: 'Pending' },
  { id: '#CPR-1253', customer: 'Riya Patel', email: 'riyapatel@email.com', date: 'May 24, 2025', time: '09:15 AM', amount: '₹980', items: '2 items', method: 'UPI', paymentStatus: 'Paid', status: 'Processing' },
  { id: '#CPR-1252', customer: 'Ankit Verma', email: 'ankitverma@email.com', date: 'May 23, 2025', time: '08:45 PM', amount: '₹1,450', items: '4 items', method: 'Card', paymentStatus: 'Paid', status: 'Shipped' },
  { id: '#CPR-1251', customer: 'Pooja Mehta', email: 'poojamehta@email.com', date: 'May 23, 2025', time: '06:20 PM', amount: '₹2,350', items: '5 items', method: 'Net Banking', paymentStatus: 'Paid', status: 'Delivered' },
  { id: '#CPR-1250', customer: 'Karan Singh', email: 'karansingh@email.com', date: 'May 23, 2025', time: '04:10 PM', amount: '₹890', items: '2 items', method: 'COD', paymentStatus: 'Pending', status: 'Pending' },
  { id: '#CPR-1249', customer: 'Sneha Iyer', email: 'snehaiyer@email.com', date: 'May 22, 2025', time: '02:35 PM', amount: '₹1,680', items: '3 items', method: 'UPI', paymentStatus: 'Paid', status: 'Shipped' },
  { id: '#CPR-1248', customer: 'Rahul Gupta', email: 'rahulgupta@email.com', date: 'May 22, 2025', time: '11:50 AM', amount: '₹760', items: '1 item', method: 'Card', paymentStatus: 'Paid', status: 'Delivered' },
];
