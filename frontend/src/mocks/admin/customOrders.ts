import { Briefcase, Clock, CheckCircle, Star } from 'lucide-react'

export const customOrderStatsData = [
  { id: 1, label: 'TOTAL REQUESTS', value: '1,452', trend: '12.5%', isPositive: true, comparison: 'vs last 7 days', icon: Briefcase, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'PENDING QUOTES', value: '34', trend: '8.2%', isPositive: false, comparison: 'vs last 7 days', icon: Clock, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'APPROVED', value: '892', trend: '18.4%', isPositive: true, comparison: 'vs last 7 days', icon: CheckCircle, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'COMPLETED', value: '458', trend: '24.5%', isPositive: true, comparison: 'vs last 7 days', icon: Star, color: '#10B981', bg: '#D1FAE5' },
];

import customOrdersJson from '../seed/admin/customOrders.json';

export const customOrdersData = customOrdersJson;
