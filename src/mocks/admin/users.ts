import { Users, Shield, Edit, Key } from 'lucide-react'

export const userStatsData = [
  { id: 1, label: 'TOTAL USERS', value: '3', trend: '0.0%', isPositive: true, isNeutral: true, icon: Users, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'ACTIVE USERS', value: '3', trend: '100%', isPositive: true, isNeutral: false, icon: Shield, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'ADMINISTRATORS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Shield, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'EDITORS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Edit, color: 'var(--admin-purple)', bg: '#F3E5F5' },
  { id: 5, label: 'SUPER ADMINS', value: '1', trend: '33.3%', isPositive: true, isNeutral: false, icon: Key, color: '#5C3317', bg: '#F5F5DC' },
];

export const usersData = [
  {
    id: 1,
    name: 'Priyanka',
    email: 'priyanka@cakepoprush.com',
    initials: 'PR',
    avatarBg: '#FFF0F5',
    avatarColor: 'var(--admin-pink)',
    isYou: false,
    role: 'Super Admin',
    status: 'Active',
    lastLoginDate: 'May 24, 2025',
    lastLoginTime: '10:30 AM',
    joinDate: 'Jan 01, 2024',
    joinTime: '11:00 AM'
  },
  {
    id: 2,
    name: 'Sravani',
    email: 'sravani@cakepoprush.com',
    initials: 'SR',
    avatarBg: '#FFF8E1',
    avatarColor: '#F59E0B',
    isYou: false,
    role: 'Administrator',
    status: 'Active',
    lastLoginDate: 'May 24, 2025',
    lastLoginTime: '09:15 AM',
    joinDate: 'Jan 10, 2024',
    joinTime: '09:30 AM'
  },
  {
    id: 3,
    name: 'Dhanush',
    email: 'dhanush@cakepoprush.com',
    initials: 'DH',
    avatarBg: '#E0FAFC',
    avatarColor: 'var(--admin-cyan)',
    isYou: true,
    role: 'Editor',
    status: 'Active',
    lastLoginDate: 'May 24, 2025',
    lastLoginTime: '08:45 AM',
    joinDate: 'Jan 15, 2024',
    joinTime: '02:20 PM'
  }
];
