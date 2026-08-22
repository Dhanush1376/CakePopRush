import categoriesJson from './seed/admin/categories.json';
import couponsJson from './seed/admin/coupons.json';
import orderDetailJson from './seed/admin/orderDetail.json';

// --- Types ---
export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  products: number;
  status: string;
  created: string;
  icon: string;
  color: string;
  bg: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discount: string;
  discountDesc: string;
  type: string;
  minOrder: string;
  used: number;
  limit: number;
  validityRange: string;
  validityTimeLeft: string;
  status: string;
  codeColor: string;
  barColor: string;
}

export interface AdminOrderDetail {
  id: string;
  orderId: string;
  date: string;
  time: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    category: string;
    price: string;
    qty: number;
    total: string;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
    orders: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  summary: {
    subtotal: string;
    delivery: string;
    discount: string;
    tax: string;
    total: string;
  };
  timeline: Array<{
    id: string;
    event: string;
    timestamp: string;
    note: string;
  }>;
  notes: Array<{
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }>;
}

// --- Internal State ---
let categories: AdminCategory[] = [];
let coupons: AdminCoupon[] = [];
let orderDetails: Record<string, AdminOrderDetail> = {};

// --- Initialization ---
export function resetRuntimeStore() {
  categories = JSON.parse(JSON.stringify(categoriesJson));
  coupons = JSON.parse(JSON.stringify(couponsJson));
  // Order details are fetched by ID, so we maintain a map.
  // Initially empty, populated on demand from seed.
  orderDetails = {};
}

// Initialize on first load
resetRuntimeStore();

// --- Exported Store API ---
export const runtimeStore = {
  // Categories
  getCategories: (): AdminCategory[] => {
    return [...categories];
  },
  
  updateCategory: (id: string, updates: Partial<AdminCategory>): AdminCategory | null => {
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    categories[idx] = { ...categories[idx], ...updates };
    return categories[idx];
  },

  addCategory: (category: Partial<AdminCategory>): AdminCategory => {
    const newCategory: AdminCategory = {
      id: category.id || `cat_${Date.now()}`,
      name: category.name || 'New Category',
      description: category.description || 'New category description',
      products: category.products || 0,
      status: category.status || 'Active',
      created: category.created || new Date().toISOString(),
      icon: category.icon || 'Package',
      color: category.color || 'var(--admin-pink)',
      bg: category.bg || '#FFF0F5'
    };
    categories = [newCategory, ...categories];
    return newCategory;
  },

  // Coupons
  getCoupons: (): AdminCoupon[] => {
    return [...coupons];
  },

  deleteCoupon: (id: number): boolean => {
    const initialLen = coupons.length;
    coupons = coupons.filter(c => c.id !== id);
    return coupons.length < initialLen;
  },

  // Order Details
  getOrderDetail: (id: string): AdminOrderDetail => {
    if (!orderDetails[id]) {
      // Lazy load from seed and deep clone
      orderDetails[id] = JSON.parse(JSON.stringify({ ...orderDetailJson, id, orderId: `#ORD-${id.split('-')[0]}` }));
    }
    return JSON.parse(JSON.stringify(orderDetails[id]));
  },

  updateOrderDetail: (id: string, updates: Partial<AdminOrderDetail>): AdminOrderDetail | null => {
    if (!orderDetails[id]) {
      runtimeStore.getOrderDetail(id); // Lazy load first
    }
    orderDetails[id] = { ...orderDetails[id], ...updates };
    return JSON.parse(JSON.stringify(orderDetails[id]));
  },

  // Reset
  reset: resetRuntimeStore
};
