import { Ticket, Tag, Calendar, Wallet, Gift } from 'lucide-react'

export const couponStatsData = [
  { id: 1, label: 'TOTAL COUPONS', value: '24', trend: '14.3%', isPositive: true, comparison: 'vs last 7 days', icon: Ticket, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE COUPONS', value: '18', trend: '12.6%', isPositive: true, comparison: 'vs last 7 days', icon: Tag, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'TOTAL REDEMPTIONS', value: '3,248', trend: '18.7%', isPositive: true, comparison: 'vs last 7 days', icon: Calendar, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'TOTAL DISCOUNT GIVEN', value: '₹1,45,230', trend: '22.4%', isPositive: true, comparison: 'vs last 7 days', icon: Wallet, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 5, label: 'EXPIRING SOON', value: '5', trend: '16.7%', isPositive: false, comparison: 'vs last 7 days', icon: Gift, color: '#5C3317', bg: '#F5F5DC' },
];

import couponsJson from '../seed/admin/coupons.json';

export const couponsData = couponsJson;
