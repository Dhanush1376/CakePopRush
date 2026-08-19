import React from 'react';
import { ChefHat, Truck, FileText, Box, PackageCheck } from 'lucide-react';
import { TrackingStep } from '../types';

export const TRACKING_STEPS: TrackingStep[] = [
    { status: 'confirmed', label: 'Order Confirmed', desc: 'We have received your order', icon: <FileText size={20} />, color: '#10B981' },
    { status: 'preparing', label: 'Preparing', desc: 'Baking your delicious treats', icon: <ChefHat size={20} />, color: '#F59E0B' },
    { status: 'packed', label: 'Packed', desc: 'Ready for dispatch', icon: <Box size={20} />, color: '#3B82F6' },
    { status: 'shipped', label: 'Out for Delivery', desc: 'Agent is on the way', icon: <Truck size={20} />, color: '#6366F1' },
    { status: 'delivered', label: 'Delivered', desc: 'Enjoy your Cake Pops!', icon: <PackageCheck size={20} />, color: '#EC4899' },
  ];

export const getTrackingSteps = (status: string): TrackingStep[] => {
  const statusIndex = TRACKING_STEPS.findIndex(s => s.status === status);
  
  return TRACKING_STEPS.map((step, index) => {
    if (index <= statusIndex) {
      if (index === 0) {
        return { ...step, date: 'Aug 8', time: '2:35 PM' };
      } else if (index === 1) {
        return { ...step, date: 'Aug 8', time: '3:00 PM' };
      } else if (index === 2) {
        return { ...step, date: 'Aug 9', time: '9:15 AM' };
      } else if (index === 3) {
        return { ...step, date: 'Aug 9', time: '10:30 AM' };
      } else if (index === 4) {
        return { ...step, date: 'Aug 9', time: '4:12 PM' };
      }
    }
    return step;
  });
};

export const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  packed: 3,
  shipped: 4,
  delivered: 5,
};
