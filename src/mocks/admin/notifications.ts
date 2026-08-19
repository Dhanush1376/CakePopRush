import { Send, Bell, Mail, Eye } from 'lucide-react'

export const notificationStatsData = [
  { id: 1, label: 'TOTAL NOTIFICATIONS', value: '128', trend: '12.5%', isPositive: true, comparison: 'vs last 7 days', icon: Send, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'SENT', value: '104', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: Bell, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'DELIVERED', value: '98', trend: '15.4%', isPositive: true, comparison: 'vs last 7 days', icon: Mail, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'READ', value: '68', trend: '13.2%', isPositive: true, comparison: 'vs last 7 days', icon: Eye, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'CLICK-THROUGH RATE', value: '12.8%', trend: '3.6%', isPositive: true, comparison: 'vs last 7 days', icon: Mail, color: '#5C3317', bg: '#F5F5DC' },
];

export const notificationsData = [
  { id: 1, title: 'Weekend Special Offer', message: 'Enjoy Flat 20% OFF on all Cake Pops!', type: 'Promotional', channels: ['bell', 'mail', 'sms'], audience: 'All Customers', users: '2,450 users', status: 'Sent', date: 'May 24, 2025', time: '10:30 AM', delivered: 92, ctr: 14.6 },
  { id: 2, title: 'New Arrivals Alert', message: 'Check out our latest cake pop flavors.', type: 'Informational', channels: ['bell', 'mail', 'sms'], audience: 'Subscribed Users', users: '1,832 users', status: 'Sent', date: 'May 22, 2025', time: '09:15 AM', delivered: 89, ctr: 11.3 },
  { id: 3, title: 'Order Confirmed', message: 'Your order #CPR1256 has been confirmed.', type: 'Transactional', channels: ['mail', 'sms'], audience: 'Specific Users', users: '1 user', status: 'Sent', date: 'May 21, 2025', time: '06:45 PM', delivered: 100, ctr: 28.4 },
  { id: 4, title: 'We Miss You!', message: 'Come back and get 15% OFF.', type: 'Promotional', channels: ['mail', 'sms'], audience: 'Inactive Users', users: '652 users', status: 'Scheduled', date: 'May 28, 2025', time: '11:00 AM', delivered: null, ctr: null },
  { id: 5, title: 'Happy Birthday!', message: "Here's 25% OFF on your special day.", type: 'Occasional', channels: ['mail', 'sms'], audience: 'Birthday Users', users: '120 users', status: 'Scheduled', date: 'May 30, 2025', time: '08:00 AM', delivered: null, ctr: null },
  { id: 6, title: 'Payment Failed', message: "We couldn't process your payment.", type: 'Transactional', channels: ['mail', 'sms'], audience: 'Specific Users', users: '3 users', status: 'Failed', date: 'May 20, 2025', time: '02:20 PM', delivered: null, ctr: null, error: true },
];
