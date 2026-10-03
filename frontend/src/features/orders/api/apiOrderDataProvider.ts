import { OrderDataProvider } from './orderDataProvider';
import { Order } from '@/types/order';
import { OrderDetail } from '../types';
import { apiClient } from '@/lib/api/client';

const mapMongoOrderToOrderDetail = (raw: any): OrderDetail => {
  const addr = raw.delivery?.addressSnapshot || raw.shippingAddress || {};
  const items = Array.isArray(raw.items) ? raw.items : [];
  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();

  return {
    id: raw.orderNumber || raw._id || 'CPR-ORDER',
    date: createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: createdAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
    status: raw.orderStatus || raw.status || 'CONFIRMED',
    internalStatus: raw.internalStatus || undefined,
    deliveryOtp: raw.deliveryOtp || raw.delivery?.customerOtp || undefined,
    orderType: 'Delivery',
    estimatedDelivery: 'Same Day Delivery',
    estimatedTime: 'Within 2-4 Hours',
    items: items.map((it: any) => ({
      id: it.productId || it.id || 'item',
      name: it.name || 'Cake Pop Delight',
      variant: it.variant || undefined,
      qty: it.quantity || it.qty || 1,
      unitPrice: it.price || it.unitPrice || 0,
      discount: 0,
      subtotal: (it.price || it.unitPrice || 0) * (it.quantity || it.qty || 1),
      icon: null,
      image: it.image || it.imageSrc || undefined,
    })),
    totalProducts: items.length,
    totalQuantity: items.reduce((sum: number, it: any) => sum + (it.quantity || it.qty || 1), 0),
    address: {
      recipientName: addr.recipientName || raw.customerName || 'Valued Customer',
      phone: addr.phone || raw.customerPhone || '',
      houseNo: addr.line1 || 'Address Line 1',
      building: addr.line2 || '',
      street: addr.landmark || addr.street || addr.line1 || '',
      area: addr.city || 'Bangalore',
      city: addr.city || 'Bangalore',
      state: addr.state || 'Karnataka',
      pincode: addr.pincode || '560001',
      type: (addr.type === 'work' ? 'Work' : 'Home') as 'Home' | 'Work' | 'Other',
      instructions: addr.deliveryInstructions || '',
    },
    price: {
      itemSubtotal: raw.subtotal || raw.total || 0,
      productDiscount: 0,
      couponDiscount: raw.discount || 0,
      deliveryFee: raw.deliveryFee || 0,
      packagingFee: 0,
      taxes: 0,
      totalDiscount: raw.discount || 0,
      amountPaid: raw.total || 0,
    },
    payment: {
      method: raw.payment?.method || raw.paymentMethod || 'Razorpay',
      status: raw.payment?.status || raw.paymentStatus || 'Paid',
      transactionId: raw.payment?.transactionId || raw.payment?.razorpayPaymentId || 'TXN-DIRECT',
      date: createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: createdAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      provider: raw.payment?.provider || 'Razorpay Gateway',
      amountPaid: raw.total || 0,
    },
    customer: {
      id: String(raw.user || raw.customer || 'cust_1'),
      orderCount: 1,
      name: raw.customerName || 'Customer',
      email: raw.customerEmail || '',
      phone: raw.customerPhone || addr.phone || '',
      address: `${addr.line1 || ''}, ${addr.city || ''}`,
    },
    agent: raw.delivery?.agentId ? {
      name: raw.delivery.agentId.name || 'Assigned Delivery Partner',
      avatar: raw.delivery.agentId.avatar || '',
      rating: 4.9,
      phone: raw.delivery.agentId.phone || '',
    } : undefined,
    invoiceNumber: `INV-${raw.orderNumber || raw._id}`,
    invoiceDate: createdAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
};

export const apiOrderDataProvider: OrderDataProvider = {
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/orders/my-orders', {
        credentials: 'include',
      });
      const list = response.data || [];
      return list.map((raw) => {
        const d = mapMongoOrderToOrderDetail(raw);
        return {
          id: d.id,
          date: d.date,
          status: d.status,
          internalStatus: d.internalStatus,
          deliveryOtp: d.deliveryOtp,
          total: d.price.amountPaid,
          amount: d.price.amountPaid,
          time: d.time,
          orderType: d.orderType,
          customer: d.customer.name,
          address: {
            recipientName: d.address.recipientName,
            phone: d.address.phone,
            street: d.address.street,
            city: d.address.city,
            state: d.address.state,
            pincode: d.address.pincode,
          },
          price: d.price,
          items: d.items.map((it) => ({
            id: it.id,
            name: it.name,
            qty: it.qty,
            unitPrice: it.unitPrice,
            subtotal: it.subtotal,
            price: it.unitPrice,
            image: it.image,
          })),
          payment: {
            method: d.payment.method,
            status: d.payment.status,
          },
          estimatedDelivery: d.estimatedDelivery,
          estimatedTime: d.estimatedTime,
        };
      });
    } catch (err) {
      console.warn('[API] Customer orders API failed:', err);
      return [];
    }
  },

  getOrderById: async (id: string): Promise<OrderDetail | undefined> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/orders/${id}`, {
        credentials: 'include',
      });
      if (response.data) {
        return mapMongoOrderToOrderDetail(response.data);
      }
      return undefined;
    } catch (err) {
      console.warn(`[API] Failed to fetch order by id ${id}:`, err);
      return undefined;
    }
  },
};

export default apiOrderDataProvider;
