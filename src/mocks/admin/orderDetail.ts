export const orderDetailData = {
  id: '#CPR-1254',
  date: 'May 24, 2025',
  time: '10:30 AM',
  status: 'Pending',
  orderType: 'Delivery',
  estimatedDelivery: 'May 25, 2025',
  estimatedTime: '2:00 PM - 5:00 PM',
  
  customer: {
    name: 'Neha Sharma',
    email: 'neha.sharma@email.com',
    phone: '+91 98765 43210',
    id: 'CUST-0892',
    ordersCount: 12
  },

  address: {
    recipientName: 'Neha Sharma',
    phone: '+91 98765 43210',
    street: '404, Maple Heights, 12th Main Road',
    city: 'Indiranagar, Bangalore',
    state: 'Karnataka',
    pincode: '560038'
  },

  items: [
    {
      id: 'ITEM-1',
      name: 'Strawberry Bliss Pops',
      sku: 'CPR-001',
      category: 'Fruity',
      qty: 2,
      unitPrice: 499,
      subtotal: 998,
      image: '/images/Products/mini valentine cake.jpeg'
    },
    {
      id: 'ITEM-2',
      name: 'Chocolate Crunch Pops',
      sku: 'CPR-002',
      category: 'Chocolate',
      qty: 1,
      unitPrice: 499,
      subtotal: 499,
      image: '/images/Products/Dark choclate cakepops.jpeg'
    }
  ],

  price: {
    itemSubtotal: 1497,
    couponDiscount: 100,
    deliveryFee: 50,
    taxes: 70, // ~5%
    amountPaid: 1517
  },

  payment: {
    method: 'Online - UPI',
    status: 'Paid',
    transactionId: 'TXN-982736451',
    date: 'May 24, 2025 at 10:32 AM'
  },

  timeline: [
    {
      id: 't1',
      event: 'Order Placed',
      timestamp: 'May 24, 2025 · 10:30 AM',
      note: 'Order #CPR-1254 created'
    },
    {
      id: 't2',
      event: 'Payment Received',
      timestamp: 'May 24, 2025 · 10:32 AM',
      note: 'UPI transaction successful'
    }
  ],

  notes: [
    {
      id: 'n1',
      author: 'Admin User',
      timestamp: 'May 24, 2025 · 11:00 AM',
      content: 'Customer requested eggless preparation. Confirmed with kitchen.'
    }
  ]
};
