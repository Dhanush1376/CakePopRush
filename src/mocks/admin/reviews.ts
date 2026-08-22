import { MessageSquare, Star, ThumbsUp, AlertCircle } from 'lucide-react'

export const reviewStatsData = [
  { id: 1, label: 'TOTAL REVIEWS', value: '1,248', trend: '18.6%', isPositive: true, comparison: 'vs last 7 days', icon: MessageSquare, color: 'var(--admin-pink)', bg: '#FFF0F5' },
  { id: 2, label: 'AVERAGE RATING', value: '4.8', trend: '2.4%', isPositive: true, comparison: 'vs last 7 days', icon: Star, color: '#F59E0B', bg: '#FFF8E1' },
  { id: 3, label: 'POSITIVE REVIEWS', value: '92%', trend: '4.2%', isPositive: true, comparison: 'vs last 7 days', icon: ThumbsUp, color: 'var(--admin-cyan)', bg: '#E0FAFC' },
  { id: 4, label: 'NEEDS ATTENTION', value: '12', trend: '14.5%', isPositive: false, comparison: 'vs last 7 days', icon: AlertCircle, color: '#DC2626', bg: '#FEE2E2' },
];

import reviewsJson from '../seed/admin/reviews.json';

export const reviewsData = reviewsJson;
