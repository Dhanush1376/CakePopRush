import { ICustomOrder } from '../models/CustomOrder';

export const getStatusClass = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes('pending')) return 'pending';
  if (s.includes('quot')) return 'quoted';
  if (s.includes('approv')) return 'approved';
  if (s.includes('progress') || s.includes('production')) return 'in_progress';
  if (s.includes('complete') || s.includes('deliver') || s.includes('ready')) return 'completed';
  if (s.includes('reject') || s.includes('cancel')) return 'rejected';
  return 'pending';
};

const AVATAR_PALETTES = [
  { bg: '#FFF0F5', color: '#FF3366' },
  { bg: '#FFF8E1', color: '#F59E0B' },
  { bg: '#E0FAFC', color: '#06B6D4' },
  { bg: '#EDE9FE', color: '#8B5CF6' },
  { bg: '#D1FAE5', color: '#10B981' },
];

export const getCustomerInitials = (name?: string): string => {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getAvatarColors = (name?: string) => {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

export const formatDisplayDate = (d: Date | string): string => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const mapCustomOrderToDto = (order: ICustomOrder, options?: { isStaff?: boolean }) => {
  const isStaff = Boolean(options?.isStaff);
  const avatarColors = getAvatarColors(order.customerName);
  const initials = getCustomerInitials(order.customerName);
  const statusClass = getStatusClass(order.status);

  const dto: Record<string, any> = {
    id: order.orderId || order._id.toString(),
    _id: order._id.toString(),
    orderId: order.orderId || `REQ-${order._id.toString().slice(-4).toUpperCase()}`,
    customer: order.customer ? order.customer.toString() : null,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    email: order.customerEmail,
    customerPhone: order.customerPhone || '',
    phone: order.customerPhone || '',
    initials,
    avatarColor: avatarColors.color,
    avatarBg: avatarColors.bg,
    occasion: order.occasion || 'Custom',
    quantity: order.quantity,
    targetDate: formatDisplayDate(order.targetDate),
    targetDateRaw: order.targetDate,
    createdDate: formatDisplayDate(order.createdAt),
    createdDateRaw: order.createdAt,
    status: order.status,
    statusClass,
    designImg:
      order.designImage ||
      (order.productSnapshot?.image ? order.productSnapshot.image : '') ||
      '/images/Products/mini valentine cake.jpeg',
    designImage: order.designImage || '',
    attachments: order.attachments || [],
    source: order.source,
    customOrderType: order.customOrderType,
    productId: order.productId,
    product: order.productSnapshot || null,
    productSnapshot: order.productSnapshot || null,
    occasionDescription: order.occasionDescription,
    customizationDetails: order.customizationDetails || {},
    statusHistory: order.statusHistory || [],
    formVersion: (order as any).formVersion || 1,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };

  // Only expose internal staff notes and admin notes to authenticated staff members
  if (isStaff) {
    dto.internalNotes = order.internalNotes || [];
    dto.adminNotes = order.adminNotes || '';
  }

  return dto;
};
