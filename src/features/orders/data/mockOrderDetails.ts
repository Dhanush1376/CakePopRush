import React from 'react';
import { OrderDetail } from '../types';

// ─── Mock Detailed Order Data ───────────────────────────────────────────────

import orderDetailsJson from '@/mocks/seed/storefront/orderDetails.json';

export const MOCK_ORDER_DETAILS: Record<string, OrderDetail> = orderDetailsJson as Record<string, OrderDetail>;

export const MOCK_SUCCESS_ORDER: OrderDetail = {
  id: '123',
  customer: {
    id: 'mock-1',
    orderCount: 1,
    name: 'Dhanush', email: 'dhanush@test.com', phone: '123' },
  invoiceNumber: '1',
  invoiceDate: 'Today',
  date: 'Today',
  time: 'Just now',
  status: 'confirmed',
  orderType: 'Delivery',
  estimatedDelivery: 'Today',
  estimatedTime: '6:30 PM – 7:00 PM',
  items: [
    { id: '1', name: 'Assorted Cake Pops Box', qty: 1, unitPrice: 599, discount: 0, subtotal: 599, icon: 'star', image: '/images/Products/mini valentine cake.jpeg' }
  ],
  totalProducts: 1,
  totalQuantity: 1,
  address: {
    recipientName: 'Dhanush',
    phone: '+91 98765 43210',
    houseNo: '12A',
    street: 'MG Road',
    area: 'Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    type: 'Home'
  },
  price: {
    itemSubtotal: 599,
    productDiscount: 0,
    couponDiscount: 50,
    deliveryFee: 40,
    packagingFee: 0,
    taxes: 0,
    totalDiscount: 50,
    amountPaid: 589
  },
  payment: {
    method: 'UPI',
    status: 'Paid',
    provider: 'Google Pay',
    transactionId: 'TXN123',
    date: 'Today',
    time: 'Just now',
    amountPaid: 589
  }
};
