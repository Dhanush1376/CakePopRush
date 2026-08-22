import { Users, Shield, Edit, Key } from 'lucide-react'

export const userStatsData = [
  { id: 1, label: 'TOTAL USERS', value: '3', trend: '0.0%', isPositive: true, isNeutral: true, icon: Users, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE USERS', value: '3', trend: '100%', isPositive: true, isNeutral: false, icon: Shield, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'ADMINISTRATORS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Shield, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'EDITORS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Edit, color: 'var(--admin-purple)', bg: '#F3E5F5' },
  { id: 5, label: 'SUPER ADMINS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Key, color: '#5C3317', bg: '#F5F5DC' },
];

import usersJson from '../seed/admin/users.json';

export const usersData = usersJson;
