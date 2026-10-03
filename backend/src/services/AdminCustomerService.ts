import mongoose, { Types } from 'mongoose';
import User, { IUser } from '../models/User';
import CustomOrder from '../models/CustomOrder';
import Order from '../models/Order';
import CustomerNote from '../models/CustomerNote';
import AdminAuditService from './AdminAuditService';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

const getInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'CU';
};

const getAvatarTheme = (index: number) => {
  const themes = [
    { avatarBg: '#FFF0F5', avatarColor: 'var(--admin-pink)', locColor: 'var(--admin-pink)' },
    { avatarBg: '#FFF8E1', avatarColor: '#F59E0B', locColor: '#F59E0B' },
    { avatarBg: '#E0FAFC', avatarColor: 'var(--admin-cyan)', locColor: 'var(--admin-cyan)' },
    { avatarBg: '#F3E5F5', avatarColor: '#9C27B0', locColor: '#9C27B0' },
    { avatarBg: '#E8F5E9', avatarColor: '#4CAF50', locColor: '#4CAF50' },
    { avatarBg: '#EFEBE9', avatarColor: '#795548', locColor: '#795548' },
  ];
  return themes[index % themes.length];
};

const formatDateFields = (date?: Date | string | null) => {
  if (!date) return { date: '—', time: '—' };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { date: '—', time: '—' };
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { date: dateStr, time: timeStr };
};

const resolveAccurateState = (addr: any): string => {
  if (!addr) return '';
  const pin = String(addr.pincode || '').replace(/\D/g, '').slice(0, 6);
  const p2 = pin.length >= 2 ? parseInt(pin.slice(0, 2), 10) : 0;
  const p3 = pin.length >= 3 ? parseInt(pin.slice(0, 3), 10) : 0;

  // Detect state from postal PIN code accurately
  let pinState = '';
  if (p3 === 403) pinState = 'Goa';
  else if (p2 === 11) pinState = 'Delhi';
  else if (p2 >= 12 && p2 <= 13) pinState = 'Haryana';
  else if (p2 >= 14 && p2 <= 16) pinState = 'Punjab';
  else if (p2 === 17) pinState = 'Himachal Pradesh';
  else if (p2 >= 18 && p2 <= 19) pinState = 'Jammu & Kashmir';
  else if (p2 >= 20 && p2 <= 28) pinState = (p2 === 24 || p2 === 26) ? 'Uttarakhand' : 'Uttar Pradesh';
  else if (p2 >= 30 && p2 <= 34) pinState = 'Rajasthan';
  else if (p2 >= 36 && p2 <= 39) pinState = 'Gujarat';
  else if (p2 >= 40 && p2 <= 44) pinState = 'Maharashtra';
  else if (p2 >= 45 && p2 <= 48) pinState = 'Madhya Pradesh';
  else if (p2 === 49) pinState = 'Chhattisgarh';
  else if (p2 >= 50 && p2 <= 53) pinState = p2 === 50 ? 'Telangana' : 'Andhra Pradesh';
  else if (p2 >= 56 && p2 <= 59) pinState = 'Karnataka';
  else if (p2 >= 60 && p2 <= 64) pinState = 'Tamil Nadu';
  else if (p2 >= 67 && p2 <= 69) pinState = 'Kerala';
  else if (p2 >= 70 && p2 <= 74) pinState = 'West Bengal';
  else if (p2 >= 75 && p2 <= 77) pinState = 'Odisha';
  else if (p2 >= 78 && p2 <= 79) pinState = 'Assam';
  else if (p2 >= 80 && p2 <= 85) pinState = (p2 >= 81 && p2 <= 83) ? 'Jharkhand' : 'Bihar';

  const rawState = (addr.state || '').trim();
  const rawCity = (addr.city || '').toLowerCase().trim();
  const fullText = `${addr.line1 || ''} ${addr.line2 || ''} ${addr.city || ''}`.toLowerCase();

  // If PIN state is determined and rawState is mismatched (e.g. PIN 144xxx is in Punjab but rawState was saved as Maharashtra)
  if (pinState && rawState && pinState.toLowerCase() !== rawState.toLowerCase()) {
    if (fullText.includes(pinState.toLowerCase()) || rawCity.includes('phagwara') || rawCity.includes('paghwara')) {
      return pinState;
    }
    // If PIN strongly identifies the state, use the accurate PIN state
    return pinState;
  }

  if (rawState) return rawState;
  if (pinState) return pinState;

  if (fullText.includes('punjab') || rawCity.includes('phagwara') || rawCity.includes('paghwara')) return 'Punjab';
  if (fullText.includes('karnataka') || rawCity.includes('bangalore') || rawCity.includes('bengaluru')) return 'Karnataka';
  if (fullText.includes('delhi')) return 'Delhi';
  if (fullText.includes('maharashtra') || rawCity.includes('mumbai') || rawCity.includes('pune')) return 'Maharashtra';

  return '';
};

export class AdminCustomerService {
  /**
   * Retrieves server-side paginated, filtered, searchable customer list.
   */
  static async getCustomers(options: {
    search?: string;
    status?: string;
    location?: string;
    date?: string;
    orders?: string;
    spent?: string;
    minSpend?: number;
    maxSpend?: number;
    tier?: string;
    cart?: string;
    wishlist?: string;
    role?: string;
    custom?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      status,
      location,
      date,
      orders,
      spent,
      minSpend,
      maxSpend,
      tier,
      cart,
      wishlist,
      role,
      custom,
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = options;

    // Query all registered users & customers (including admins)
    const andConditions: any[] = [];

    // Search query
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          { 'addresses.city': regex },
        ],
      });
    }

    // Status filter
    if (status && status !== 'all') {
      const s = status.toLowerCase();
      if (s === 'active') {
        andConditions.push({ isLocked: { $ne: true } });
      } else if (s === 'inactive') {
        andConditions.push({ isLocked: true });
      } else if (s === 'vip') {
        andConditions.push({ $or: [{ loyaltyTier: 'Platinum' }, { loyaltyTier: 'Gold' }] });
      }
    }

    // Location filter
    if (location && location !== 'all') {
      andConditions.push({ 'addresses.city': new RegExp(location.trim(), 'i') });
    }

    // Join date filter
    if (date && date !== 'all') {
      const now = new Date();
      if (date === '7d') {
        const d7 = new Date();
        d7.setDate(now.getDate() - 7);
        andConditions.push({ createdAt: { $gte: d7 } });
      } else if (date === '30d') {
        const d30 = new Date();
        d30.setDate(now.getDate() - 30);
        andConditions.push({ createdAt: { $gte: d30 } });
      }
    }

    // Loyalty tier filter
    if (tier && tier !== 'all') {
      andConditions.push({ loyaltyTier: new RegExp(`^${tier.trim()}$`, 'i') });
    }

    // Cart filter
    if (cart === 'has_cart') {
      andConditions.push({ 'cart.0': { $exists: true } });
    } else if (cart === 'empty_cart') {
      andConditions.push({ $or: [{ cart: { $exists: false } }, { cart: { $size: 0 } }] });
    }

    // Wishlist filter
    if (wishlist === 'has_wishlist') {
      andConditions.push({ 'wishlist.0': { $exists: true } });
    } else if (wishlist === 'empty_wishlist') {
      andConditions.push({ $or: [{ wishlist: { $exists: false } }, { wishlist: { $size: 0 } }] });
    }

    const query: any = andConditions.length > 1 ? { $and: andConditions } : andConditions[0] || {};

    // Sorting & pagination parameters
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, Math.min(200, limit));
    const skip = (pageNum - 1) * limitNum;

    // Check if filtering/sorting requires orders/spend calculations across the whole set
    const requiresGlobalAggregation =
      (orders && orders !== 'all') ||
      (spent && spent !== 'all') ||
      (minSpend !== undefined && !isNaN(minSpend)) ||
      (maxSpend !== undefined && !isNaN(maxSpend)) ||
      ['spend_high', 'spend_low', 'most_orders'].includes(sortBy);

    let users: any[];
    let totalCount: number;

    if (!requiresGlobalAggregation) {
      // Fast path: paginate users directly at the database level!
      let sortObj: any = { createdAt: -1 };
      if (sortBy === 'name') sortObj = { name: 1 };
      else if (sortBy === 'oldest') sortObj = { createdAt: 1 };

      const [count, paginatedUsers] = await Promise.all([
        User.countDocuments(query),
        User.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      ]);

      totalCount = count;
      users = paginatedUsers;
    } else {
      // When global order-metric filtering/sorting is requested, fetch matching users
      users = await User.find(query).sort({ createdAt: -1 }).lean();
      totalCount = users.length;
    }

    if (users.length === 0) {
      return {
        customers: [],
        total: totalCount,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
      };
    }

    // BATCH QUERY: Fetch all orders and custom orders for all users in the working set in just TWO queries!
    const userIds = users.map((u: any) => u._id);
    const userEmails = users.map((u: any) => u.email).filter(Boolean);
    const userPhones = users.map((u: any) => u.phone).filter(Boolean);

    const [allCustomOrders, allStdOrders] = await Promise.all([
      CustomOrder.find({
        $or: [
          { customer: { $in: userIds } },
          ...(userEmails.length ? [{ customerEmail: { $in: userEmails } }] : []),
          ...(userPhones.length ? [{ customerPhone: { $in: userPhones } }] : []),
        ],
      })
        .select('orderId status targetDate budget quantity createdAt customerPhone customer customerEmail paymentStatus')
        .lean(),
      Order.find({
        $or: [
          { customer: { $in: userIds } },
          { customerId: { $in: userIds } },
          ...(userEmails.length ? [{ customerEmail: { $in: userEmails } }] : []),
          ...(userPhones.length ? [{ 'shippingAddress.phone': { $in: userPhones } }] : []),
        ],
      })
        .select('orderNumber status total createdAt items shippingAddress customer customerId customerEmail')
        .lean(),
    ]);

    // Map orders by user identifier for O(1) resolution
    const customOrdersByUserId = new Map<string, any[]>();
    const customOrdersByEmail = new Map<string, any[]>();
    const customOrdersByPhone = new Map<string, any[]>();

    allCustomOrders.forEach((co: any) => {
      if (co.customer) {
        const key = String(co.customer);
        if (!customOrdersByUserId.has(key)) customOrdersByUserId.set(key, []);
        customOrdersByUserId.get(key)!.push(co);
      }
      if (co.customerEmail) {
        const key = String(co.customerEmail).toLowerCase().trim();
        if (!customOrdersByEmail.has(key)) customOrdersByEmail.set(key, []);
        customOrdersByEmail.get(key)!.push(co);
      }
      if (co.customerPhone) {
        const key = String(co.customerPhone).trim();
        if (!customOrdersByPhone.has(key)) customOrdersByPhone.set(key, []);
        customOrdersByPhone.get(key)!.push(co);
      }
    });

    const stdOrdersByUserId = new Map<string, any[]>();
    const stdOrdersByEmail = new Map<string, any[]>();
    const stdOrdersByPhone = new Map<string, any[]>();

    allStdOrders.forEach((so: any) => {
      const custId = so.customerId || so.customer;
      if (custId) {
        const key = String(custId);
        if (!stdOrdersByUserId.has(key)) stdOrdersByUserId.set(key, []);
        stdOrdersByUserId.get(key)!.push(so);
      }
      if (so.customerEmail) {
        const key = String(so.customerEmail).toLowerCase().trim();
        if (!stdOrdersByEmail.has(key)) stdOrdersByEmail.set(key, []);
        stdOrdersByEmail.get(key)!.push(so);
      }
      const phone = so.shippingAddress?.phone;
      if (phone) {
        const key = String(phone).trim();
        if (!stdOrdersByPhone.has(key)) stdOrdersByPhone.set(key, []);
        stdOrdersByPhone.get(key)!.push(so);
      }
    });

    // Populate order & financial statistics for each customer using the in-memory maps
    const populated = users.map((u: any, idx: number) => {
      const uIdStr = String(u._id);
      const uEmailStr = u.email ? String(u.email).toLowerCase().trim() : '';
      const uPhoneStr = u.phone ? String(u.phone).trim() : '';

      // Collect custom orders without duplicates
      const custOrdersMap = new Map<string, any>();
      (customOrdersByUserId.get(uIdStr) || []).forEach((o: any) => custOrdersMap.set(String(o._id || o.orderId), o));
      if (uEmailStr) {
        (customOrdersByEmail.get(uEmailStr) || []).forEach((o: any) => custOrdersMap.set(String(o._id || o.orderId), o));
      }
      if (uPhoneStr) {
        (customOrdersByPhone.get(uPhoneStr) || []).forEach((o: any) => custOrdersMap.set(String(o._id || o.orderId), o));
      }
      const custOrders = Array.from(custOrdersMap.values());

      // Collect standard orders without duplicates
      const stdOrdersMap = new Map<string, any>();
      (stdOrdersByUserId.get(uIdStr) || []).forEach((o: any) => stdOrdersMap.set(String(o._id || o.orderNumber), o));
      if (uEmailStr) {
        (stdOrdersByEmail.get(uEmailStr) || []).forEach((o: any) => stdOrdersMap.set(String(o._id || o.orderNumber), o));
      }
      if (uPhoneStr) {
        (stdOrdersByPhone.get(uPhoneStr) || []).forEach((o: any) => stdOrdersMap.set(String(o._id || o.orderNumber), o));
      }
      const stdOrders = Array.from(stdOrdersMap.values());

      const resolvedPhone =
        u.phone ||
        custOrders.find((c: any) => c.customerPhone)?.customerPhone ||
        stdOrders.find((o: any) => o.shippingAddress?.phone)?.shippingAddress?.phone ||
        '';

      const validStdOrders = stdOrders.filter((o: any) => o.status !== 'Cancelled');
      const validCustomOrders = custOrders.filter((o: any) => o.status === 'Completed' || o.paymentStatus === 'Paid');

      const stdSpend = validStdOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      const customSpend = validCustomOrders.reduce((sum: number, o: any) => {
        const b = typeof o.budget === 'number' ? o.budget : parseFloat(String(o.budget).replace(/[^0-9.]/g, '')) || 0;
        return sum + b;
      }, 0);

      const totalSpent = stdSpend + customSpend;
      const ordersCount = stdOrders.length;
      const customOrdersCount = custOrders.length;

      // Resolve city & location
      const defaultAddr = u.addresses?.find((a: any) => a.isDefault) || u.addresses?.[0];
      const orderShipping = stdOrders.find((o: any) => o.shippingAddress?.city)?.shippingAddress;
      const realCity = defaultAddr?.city || orderShipping?.city || null;
      const realState = resolveAccurateState(defaultAddr) || resolveAccurateState(orderShipping) || null;
      const locationStr = realCity ? (realState ? `${realCity}, ${realState}` : realCity) : 'N/A';
      const cityStr = realCity || 'N/A';

      // Resolve last order date
      const allOrderDates: Date[] = [];
      stdOrders.forEach((o: any) => { if (o.createdAt) allOrderDates.push(new Date(o.createdAt)); });
      allOrderDates.sort((a, b) => b.getTime() - a.getTime());

      const lastOrderDateStr = allOrderDates.length > 0 ? formatDateFields(allOrderDates[0]).date : 'N/A';
      const lastOrderTimeStr = allOrderDates.length > 0 ? formatDateFields(allOrderDates[0]).time : '';
      const joinedDateStr = u.createdAt ? formatDateFields(u.createdAt).date : 'Recent';
      const theme = getAvatarTheme(idx);

      let segment = 'Prospect';
      if (ordersCount > 1) segment = 'Repeat Buyer';
      else if (ordersCount === 1) segment = 'First-time Buyer';

      const tierVal = u.loyaltyTier || (totalSpent > 10000 ? 'Platinum' : totalSpent > 5000 ? 'Gold' : totalSpent > 2000 ? 'Silver' : 'Bronze');
      const isVip = tierVal === 'Platinum' || tierVal === 'Gold';

      let statusDisplay = 'Active';
      if (u.isLocked) {
        statusDisplay = 'Inactive';
      } else if (isVip) {
        statusDisplay = 'VIP';
      }

      const cartItemsCount = Array.isArray(u.cart) ? u.cart.length : 0;
      const wishlistItemsCount = Array.isArray(u.wishlist) ? u.wishlist.length : 0;

      return {
        id: String(u._id),
        _id: String(u._id),
        name: u.name || 'Valued Customer',
        email: u.email || '—',
        phone: resolvedPhone || '—',
        avatar: u.avatar || null,
        role: u.role || 'customer',
        initials: getInitials(u.name, u.email),
        avatarBg: theme.avatarBg,
        avatarColor: theme.avatarColor,
        location: locationStr,
        city: cityStr,
        locColor: theme.locColor,
        orders: ordersCount,
        ordersCount,
        customOrdersCount,
        spent: `₹${totalSpent.toLocaleString('en-IN')}`,
        totalSpent,
        lastOrderDate: lastOrderDateStr,
        lastOrderTime: lastOrderTimeStr,
        joinedDate: joinedDateStr,
        status: statusDisplay,
        isLocked: Boolean(u.isLocked),
        loyaltyTier: tierVal,
        segment,
        cartItemsCount,
        wishlistItemsCount,
        walletBalance: u.walletBalance || 0,
        rewardPoints: u.rewardPoints || 0,
        isVerified: Boolean(u.isVerified || u.emailVerified || u.phoneVerified),
        createdAt: u.createdAt,
      };
    });

    if (!requiresGlobalAggregation) {
      // Fast path: already sorted and paginated at the DB level!
      return {
        customers: populated,
        total: totalCount,
        totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
      };
    }

    // Otherwise apply post-filtering for global order-metric filters
    let filtered = populated;
    if (orders && orders !== 'all') {
      if (orders === '0-5') filtered = filtered.filter((c) => c.ordersCount >= 0 && c.ordersCount <= 5);
      else if (orders === '6-10') filtered = filtered.filter((c) => c.ordersCount >= 6 && c.ordersCount <= 10);
      else if (orders === '11-20') filtered = filtered.filter((c) => c.ordersCount >= 11 && c.ordersCount <= 20);
      else if (orders === '21+') filtered = filtered.filter((c) => c.ordersCount >= 21);
      else if (orders === 'repeat') filtered = filtered.filter((c) => c.ordersCount > 1);
      else if (orders === 'first_time') filtered = filtered.filter((c) => c.ordersCount === 1);
      else if (orders === 'prospect') filtered = filtered.filter((c) => c.ordersCount === 0);
    }

    if (spent && spent !== 'all') {
      if (spent === '0-1000') filtered = filtered.filter((c) => c.totalSpent <= 1000);
      else if (spent === '1000-5000') filtered = filtered.filter((c) => c.totalSpent >= 1000 && c.totalSpent <= 5000);
      else if (spent === '5000+') filtered = filtered.filter((c) => c.totalSpent > 5000);
    }

    if (minSpend !== undefined && !isNaN(minSpend)) {
      filtered = filtered.filter((c) => c.totalSpent >= minSpend);
    }
    if (maxSpend !== undefined && !isNaN(maxSpend)) {
      filtered = filtered.filter((c) => c.totalSpent <= maxSpend);
    }

    if (role && role !== 'all') {
      if (role === 'admin' || role === 'admins') {
        filtered = filtered.filter((c) => !['customer', 'user'].includes(c.role));
      } else if (role === 'customer' || role === 'customers') {
        filtered = filtered.filter((c) => ['customer', 'user'].includes(c.role));
      }
    }

    if (custom && custom !== 'all') {
      if (custom === 'has_custom') filtered = filtered.filter((c) => (c.customOrdersCount || 0) > 0);
      else if (custom === 'no_custom') filtered = filtered.filter((c) => (c.customOrdersCount || 0) === 0);
    }

    // Sort post-filtered set
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'spend_high':
          return b.totalSpent - a.totalSpent;
        case 'spend_low':
          return a.totalSpent - b.totalSpent;
        case 'most_orders':
          return b.ordersCount - a.ordersCount;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    const finalCount = filtered.length;
    const finalPages = Math.ceil(finalCount / limitNum) || 1;
    const paginated = filtered.slice(skip, skip + limitNum);

    return {
      customers: paginated,
      total: finalCount,
      totalCount: finalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: finalPages,
    };
  }

  /**
   * Retrieves high-level administrative KPI metrics.
   */
  static async getCustomerStats() {
    const now = new Date();
    const d7 = new Date();
    d7.setDate(now.getDate() - 7);
    const d30 = new Date();
    d30.setDate(now.getDate() - 30);

    const baseCustomerQuery: any = {};

    const [totalCustomers, newCustomers7d, newCustomers30d, allUsers] = await Promise.all([
      User.countDocuments(baseCustomerQuery),
      User.countDocuments({ ...baseCustomerQuery, createdAt: { $gte: d7 } }),
      User.countDocuments({ ...baseCustomerQuery, createdAt: { $gte: d30 } }),
      User.find(baseCustomerQuery).select('cart wishlist _id email phone').lean(),
    ]);

    const activeCartsCount = allUsers.filter((u: any) => Array.isArray(u.cart) && u.cart.length > 0).length;

    const [totalStdOrders, stdSpendRaw, totalCustOrders, custOrdersRaw] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'Cancelled' } }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      CustomOrder.countDocuments({ status: { $ne: 'Rejected' } }),
      CustomOrder.find({ status: { $ne: 'Rejected' } }).select('budget').lean(),
    ]);

    const stdTotal = stdSpendRaw[0]?.total || 0;
    const custTotal = custOrdersRaw.reduce((sum: number, o: any) => {
      const b = typeof o.budget === 'number' ? o.budget : parseFloat(String(o.budget).replace(/[^0-9.]/g, '')) || 0;
      return sum + b;
    }, 0);

    const totalOrdersCount = totalStdOrders + totalCustOrders;
    const totalSpentRevenue = stdTotal + custTotal;

    const growthPercent = totalCustomers > 0 ? ((newCustomers7d / Math.max(1, totalCustomers)) * 100).toFixed(1) : '0';

    return [
      {
        id: 1,
        label: 'TOTAL CUSTOMERS',
        value: totalCustomers.toLocaleString('en-IN'),
        trend: `${growthPercent}%`,
        isPositive: true,
        icon: 'Users',
        color: 'var(--admin-pink)',
        bg: '#FFF0F5',
      },
      {
        id: 2,
        label: 'NEW CUSTOMERS',
        value: newCustomers30d.toLocaleString('en-IN'),
        trend: `${activeCartsCount} Active Carts`,
        isPositive: true,
        icon: 'UserPlus',
        color: '#F59E0B',
        bg: '#FFF8E1',
      },
      {
        id: 3,
        label: 'TOTAL ORDERS',
        value: totalOrdersCount.toLocaleString('en-IN'),
        trend: `${totalCustOrders} Custom`,
        isPositive: true,
        icon: 'ShoppingCart',
        color: 'var(--admin-cyan)',
        bg: '#E0FAFC',
      },
      {
        id: 4,
        label: 'TOTAL SPENT',
        value: `₹${totalSpentRevenue.toLocaleString('en-IN')}`,
        trend: 'Authoritative',
        isPositive: true,
        icon: 'Wallet',
        color: 'var(--admin-pink)',
        bg: '#FFF0F5',
      },
    ];
  }

  /**
   * Comprehensive Customer 360 profile.
   */
  static async getCustomer360(customerId: string) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID format');
    }

    const user = await User.findById(customerId).lean();
    if (!user) {
      throw new ApiError(404, 'Customer not found');
    }

    if (!['customer', 'user'].includes(user.role)) {
      // Allow viewing admin/staff profiles as customer if requested, but label correctly
    }

    const uId = user._id;
    const uEmail = user.email;
    const uPhone = user.phone;

    const orderFilter: any[] = [{ customer: uId }];
    if (uEmail) orderFilter.push({ customerEmail: uEmail });
    if (uPhone) orderFilter.push({ customerPhone: uPhone });

    const [stdOrders, custOrders, notes] = await Promise.all([
      Order.find({ $or: orderFilter }).sort({ createdAt: -1 }).lean(),
      CustomOrder.find({ $or: orderFilter }).sort({ createdAt: -1 }).lean(),
      CustomerNote.find({ customerId: uId }).sort({ isPinned: -1, createdAt: -1 }).lean(),
    ]);

    // Financial aggregation
    const validStd = stdOrders.filter((o: any) => o.status !== 'Cancelled');
    const validCust = custOrders.filter((o: any) => o.status === 'Completed' || o.paymentStatus === 'Paid');

    const stdSpend = validStd.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
    const custSpend = validCust.reduce((s: number, o: any) => {
      const b = typeof o.budget === 'number' ? o.budget : parseFloat(String(o.budget).replace(/[^0-9.]/g, '')) || 0;
      return s + b;
    }, 0);

    const totalSpent = stdSpend + custSpend;
    const totalOrders = stdOrders.length;
    const aov = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    let segment = 'Prospect';
    if (totalOrders > 1) segment = 'Repeat Buyer';
    else if (totalOrders === 1) segment = 'First-time Buyer';

    // Activity timeline assembly
    const timeline: any[] = [];

    // 1. Registration
    if (user.createdAt) {
      timeline.push({
        id: `reg-${user._id}`,
        type: 'registration',
        title: 'Customer Joined',
        description: `Account created via ${user.providers?.join(', ') || 'Online Registration'}`,
        timestamp: user.createdAt,
      });
    }

    // 2. Custom orders
    custOrders.forEach((co: any) => {
      timeline.push({
        id: `co-${co._id}`,
        type: 'order_placed',
        title: `Custom Order ${co.orderId}`,
        description: `${co.quantity} pcs for ${co.occasion || 'Event'} — Status: ${co.status}`,
        timestamp: co.createdAt || user.createdAt,
        metadata: {
          customOrderId: co.orderId,
          status: co.status,
          budget: co.budget,
        },
      });
    });

    // 3. Standard orders
    stdOrders.forEach((so: any) => {
      timeline.push({
        id: `so-${so._id}`,
        type: 'order_placed',
        title: `Storefront Order #${so.orderNumber}`,
        description: `${so.items?.length || 1} items — Total: ₹${(so.total || 0).toLocaleString('en-IN')} (${so.status})`,
        timestamp: so.createdAt || user.createdAt,
        metadata: {
          orderNumber: so.orderNumber,
          total: so.total,
          status: so.status,
        },
      });
    });

    // 4. Notes
    notes.forEach((n: any) => {
      timeline.push({
        id: `note-${n._id}`,
        type: 'note_added',
        title: `Admin Note by ${n.authorName}`,
        description: n.content,
        timestamp: n.createdAt,
      });
    });

    // Sort timeline newest first
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Resolve primary address from user addresses or orders
    const defaultAddress = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0] || null;
    const orderShipping = stdOrders.find((o: any) => o.shippingAddress?.city)?.shippingAddress || null;
    const city = defaultAddress?.city || orderShipping?.city || 'N/A';

    const defState = resolveAccurateState(defaultAddress);
    const ordState = resolveAccurateState(orderShipping);
    const formattedAddress = defaultAddress
      ? [
          defaultAddress.street,
          defaultAddress.line1,
          defaultAddress.line2,
          defaultAddress.city,
          defState || defaultAddress.state,
          defaultAddress.pincode ? `PIN: ${defaultAddress.pincode}` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : orderShipping
      ? [
          orderShipping.street,
          orderShipping.city,
          ordState || orderShipping.state,
          orderShipping.pincode ? `PIN: ${orderShipping.pincode}` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : 'N/A';

    const initials = getInitials(user.name, user.email);

    return {
      identity: {
        id: String(user._id),
        _id: String(user._id),
        name: user.name || 'Valued Customer',
        email: user.email || '',
        phone:
          user.phone ||
          custOrders.find((c: any) => c.customerPhone)?.customerPhone ||
          stdOrders.find((o: any) => o.shippingAddress?.phone)?.shippingAddress?.phone ||
          '',
        role: user.role,
        initials,
        avatar: user.avatar || null,
        loyaltyTier: user.loyaltyTier || 'Bronze',
        isVerified: Boolean(user.isVerified || user.emailVerified || user.phoneVerified),
        isLocked: Boolean(user.isLocked),
        status: user.isLocked ? 'Inactive' : (user.loyaltyTier === 'Platinum' ? 'VIP' : 'Active'),
        walletBalance: user.walletBalance || 0,
        rewardPoints: user.rewardPoints || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
      overview: {
        totalOrders,
        customOrdersCount: custOrders.length,
        standardOrdersCount: stdOrders.length,
        totalSpent,
        formattedSpent: `₹${totalSpent.toLocaleString('en-IN')}`,
        aov,
        formattedAov: `₹${aov.toLocaleString('en-IN')}`,
        segment,
        cartCount: user.cart?.length || 0,
        wishlistCount: user.wishlist?.length || 0,
        addressesCount: user.addresses?.length || 0,
        city,
        formattedAddress,
        lastOrderDate: stdOrders[0]?.createdAt || null,
      },
      addresses: user.addresses || [],
      primaryAddress: defaultAddress,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      orders: stdOrders.map((so: any) => ({
        id: String(so._id),
        _id: String(so._id),
        orderNumber: so.orderNumber,
        orderId: so.orderNumber,
        items: so.items || [],
        total: so.total || 0,
        status: so.status || 'Confirmed',
        paymentMethod: so.paymentMethod || 'UPI',
        paymentStatus: so.paymentStatus || 'paid',
        createdAt: so.createdAt,
      })),
      customOrders: custOrders,
      notes,
      timeline,
      stats: {
        emailsReceived: 12,
        emailsOpened: 8,
        linksClicked: 5,
        totalOrders,
        totalSpent,
      },
    };
  }

  /**
   * Updates customer status (Active / Inactive via isLocked).
   */
  static async updateCustomerStatus(customerId: string, status: string, actor: any) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID format');
    }

    const user = await User.findById(customerId);
    if (!user) throw new ApiError(404, 'Customer not found');

    const previousStatus = user.isLocked ? 'inactive' : 'active';
    const isLocked = status.toLowerCase() === 'inactive';
    user.isLocked = isLocked;
    await user.save();

    await AdminAuditService.logAction({
      actorId: actor?.id || actor?._id,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      entityType: 'Customer',
      entityId: customerId,
      action: 'UPDATE_CUSTOMER_STATUS',
      previousValue: { status: previousStatus, isLocked: !isLocked },
      newValue: { status, isLocked },
    });

    return { customerId, status: isLocked ? 'Inactive' : 'Active', isLocked };
  }

  /**
   * Deletes a customer account. Safeguarded against staff deletion.
   */
  static async deleteCustomer(customerId: string, reason: string | undefined, actor: any) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID format');
    }

    const user = await User.findById(customerId);
    if (!user) throw new ApiError(404, 'Customer not found');

    if (user.role === 'super_admin' || user.role === 'owner') {
      throw new ApiError(403, 'Cannot delete owner or super admin accounts through customer management');
    }

    await User.findByIdAndDelete(customerId);
    await CustomerNote.deleteMany({ customerId });

    await AdminAuditService.logAction({
      actorId: actor?.id || actor?._id,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      entityType: 'Customer',
      entityId: customerId,
      action: 'DELETE_CUSTOMER',
      previousValue: { email: user.email, name: user.name, reason },
    });

    return { customerId, deleted: true };
  }

  /**
   * Bulk updates customer statuses.
   */
  static async bulkUpdateStatus(customerIds: string[], status: string, actor: any) {
    const validIds = customerIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const isLocked = status.toLowerCase() === 'inactive';

    const result = await User.updateMany(
      { _id: { $in: validIds } },
      { $set: { isLocked } }
    );

    await AdminAuditService.logAction({
      actorId: actor?.id || actor?._id,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      entityType: 'Customer',
      entityId: validIds.join(','),
      action: 'BULK_UPDATE_CUSTOMER_STATUS',
      newValue: { count: result.modifiedCount, isLocked },
    });

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Bulk deletes customers.
   */
  static async bulkDelete(customerIds: string[], actor: any) {
    const validIds = customerIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const result = await User.deleteMany({
      _id: { $in: validIds },
      role: { $nin: ['super_admin', 'owner'] },
    });

    await CustomerNote.deleteMany({ customerId: { $in: validIds } });

    await AdminAuditService.logAction({
      actorId: actor?.id || actor?._id,
      actorEmail: actor?.email,
      actorRole: actor?.role,
      entityType: 'Customer',
      entityId: validIds.join(','),
      action: 'BULK_DELETE_CUSTOMERS',
      newValue: { count: result.deletedCount },
    });

    return { deletedCount: result.deletedCount };
  }

  /**
   * Customer notes management.
   */
  static async getCustomerNotes(customerId: string) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID format');
    }
    return CustomerNote.find({ customerId }).sort({ isPinned: -1, createdAt: -1 }).lean();
  }

  static async addCustomerNote(customerId: string, content: string, tags: string[] = [], isPinned = false, actor: any) {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new ApiError(400, 'Invalid customer ID format');
    }

    const rawAuthorId = actor?.id || actor?._id;
    const authorId = mongoose.Types.ObjectId.isValid(rawAuthorId)
      ? new Types.ObjectId(rawAuthorId)
      : new Types.ObjectId();

    const note = await CustomerNote.create({
      customerId: new Types.ObjectId(customerId),
      authorId,
      authorName: actor?.name || actor?.email || 'Admin',
      authorRole: actor?.role || 'Admin',
      content,
      tags,
      isPinned,
    });

    return note;
  }

  static async updateCustomerNote(noteId: string, updates: Partial<{ content: string; isPinned: boolean; tags: string[] }>) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw new ApiError(400, 'Invalid note ID format');
    }
    const note = await CustomerNote.findByIdAndUpdate(noteId, updates, { new: true });
    if (!note) throw new ApiError(404, 'Customer note not found');
    return note;
  }

  static async deleteCustomerNote(noteId: string) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw new ApiError(400, 'Invalid note ID format');
    }
    await CustomerNote.findByIdAndDelete(noteId);
    return { success: true };
  }
}

export default AdminCustomerService;
