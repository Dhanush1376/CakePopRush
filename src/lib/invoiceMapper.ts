import type { InvoiceData } from '@/types/invoice';
import type { Order } from '@/types/order';

/**
 * Maps a raw application order to the standardized InvoiceData structure.
 * This ensures the invoice always renders exactly the same data everywhere.
 */
export function mapOrderToInvoiceData(order: Order): InvoiceData {
  // In a real application, you would map actual fields here.
  // We're handling the mock data structures found in AdminOrders and Storefront Orders.
  
  const orderId = order.id || '#CPR-10482';
  const cleanOrderId = orderId.replace('#', '');
  
  // Try to use provided pricing, otherwise fallback to basic math for mock data
  const subtotal = order.price?.itemSubtotal || (order.amount ? parseInt(String(order.amount).replace(/[^0-9]/g, '')) : 599);
  const couponDiscount = order.price?.couponDiscount || 0;
  const deliveryFee = order.price?.deliveryFee || (order.orderType === 'Delivery' ? 40 : 0);
  const tax = order.price?.taxes || Math.round(subtotal * 0.05); // 5% mock tax
  const total = order.price?.amountPaid || (subtotal - couponDiscount + deliveryFee + tax);
  const isPaid = (order.payment?.status || order.paymentStatus) === 'Paid';

  return {
    invoiceNumber: `INV-${cleanOrderId}`,
    orderNumber: orderId,
    invoiceDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    orderDate: order.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    
    // TODO: When connected backend we need to be able to update in CMS future course
    business: {
      name: 'Cake Pop Rush',
      address: 'Cake Pop Rush',
      cityStateZip: 'Mumbai',
      country: 'India',
      phone: '+91 98765 43210',
      email: 'support@cakepoprush.com',
      website: 'www.cakepoprush.com',
      gstin: '29ABCDE1234F1Z5'
    },

    customer: {
      name: (typeof order.customer === 'string' ? order.customer : order.customer?.name) || order.address?.recipientName || 'Valued Customer',
      email: (typeof order.customer === 'object' ? order.customer?.email : order.email) || 'customer@example.com',
      phone: (typeof order.customer === 'object' ? order.customer?.phone : order.address?.phone) || '+91 99999 99999'
    },

    billingAddress: {
      name: (typeof order.customer === 'string' ? order.customer : order.customer?.name) || order.address?.recipientName || 'Valued Customer',
      phone: order.address?.phone || '+91 99999 99999',
      email: order.email || 'customer@example.com',
      street: order.address?.street || '123 Customer St',
      city: order.address?.city || 'Mumbai',
      state: order.address?.state || 'Maharashtra',
      pincode: order.address?.pincode || '400006',
      country: 'India'
    },
    
    shippingAddress: order.orderType !== 'Pickup' ? {
      name: order.address?.recipientName || (typeof order.customer === 'string' ? order.customer : order.customer?.name) || 'Valued Customer',
      phone: order.address?.phone || '+91 99999 99999',
      street: order.address?.street || '123 Customer St',
      city: order.address?.city || 'Mumbai',
      state: order.address?.state || 'Maharashtra',
      pincode: order.address?.pincode || '400006',
      country: 'India'
    } : undefined,

    fulfillment: {
      type: order.orderType === 'Pickup' ? 'Pickup' : 'Delivery',
      date: order.estimatedDelivery || order.date || 'Today',
      timeSlot: order.estimatedTime || order.time || 'Standard',
    },

    items: Array.isArray(order.items) ? order.items.map((item: any, idx: number) => ({
      id: item.id || String(idx + 1),
      name: item.name || 'Product',
      sku: item.isCustom ? undefined : `SKU-${Math.floor(Math.random() * 10000)}`,
      isCustom: item.isCustom || item.name?.toLowerCase().includes('custom'),
      customDetails: item.customDetails,
      qty: item.qty || 1,
      unitPrice: item.unitPrice || item.subtotal || 0,
      discount: 0,
      tax: Math.round((item.unitPrice || item.subtotal || 0) * 0.05),
      total: (item.qty || 1) * (item.unitPrice || item.subtotal || 0)
    })) : [
      { id: '1', name: 'Assorted Cake Pops', sku: 'CPR-CP-001', qty: 1, unitPrice: subtotal, discount: 0, tax, total: subtotal }
    ],

    pricing: {
      subtotal,
      itemDiscount: 0,
      couponDiscount,
      tax,
      deliveryFee,
      total
    },

    payment: {
      method: order.payment?.method || order.method || 'Online',
      status: isPaid ? 'Paid' : 'Pending',
      amountPaid: isPaid ? total : 0,
      balanceDue: isPaid ? 0 : total,
    },

    coupon: couponDiscount > 0 ? {
      code: 'WELCOME50',
      description: '₹50 Off Welcome Discount'
    } : undefined,

    qrCodeUrl: `https://cakepoprush.com/verify/${cleanOrderId}`,
    barcodeValue: cleanOrderId
  };
}
