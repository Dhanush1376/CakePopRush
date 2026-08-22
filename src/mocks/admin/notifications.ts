import { Send, Bell, Mail, Eye } from 'lucide-react'

export const notificationStatsData = [
  { id: 1, label: 'TOTAL NOTIFICATIONS', value: '128', trend: '12.5%', isPositive: true, comparison: 'vs last 7 days', icon: Send, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'SENT', value: '104', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: Bell, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'DELIVERED', value: '98', trend: '15.4%', isPositive: true, comparison: 'vs last 7 days', icon: Mail, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'READ', value: '68', trend: '13.2%', isPositive: true, comparison: 'vs last 7 days', icon: Eye, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'CLICK-THROUGH RATE', value: '12.8%', trend: '3.6%', isPositive: true, comparison: 'vs last 7 days', icon: Mail, color: '#5C3317', bg: '#F5F5DC' },
];

import notificationsJson from '../seed/admin/notifications.json';

export const notificationsData = notificationsJson;
