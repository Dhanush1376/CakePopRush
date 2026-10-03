import mongoose from 'mongoose';
import CustomOrder, { ICustomOrder, CustomOrderStatus } from '../models/CustomOrder';
import CustomOrderConfig, { DEFAULT_CAKEPOPRUSH_CONFIG } from '../models/CustomOrderConfig';
import User from '../models/User';
import { resolveProductSnapshot } from './productResolver';
import { mapCustomOrderToDto } from '../utils/customOrderMapper';
import ApiError from '../utils/ApiError';
import { STAFF_ROLES } from '../config/adminConfig';
import { JwtPayload } from '../middleware/authMiddleware';
import logger from '../config/logger';
import { AdminAuditService } from './AdminAuditService';

export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export class CustomOrderService {
  /**
   * Submit a new custom order (General or Product customization)
   */
  static async createCustomOrder(payload: any, user?: JwtPayload) {
    let customerId: mongoose.Types.ObjectId | null = null;
    let customerName = payload.customerName || '';
    let customerEmail = payload.customerEmail || '';
    let customerPhone = payload.mobileNumber || payload.customerPhone || '';
    const isStaff = Boolean(user && (STAFF_ROLES as readonly string[]).includes(user.role));

    // If authenticated, always resolve customer identity securely from session
    if (user?.id) {
      if (mongoose.Types.ObjectId.isValid(user.id)) {
        customerId = new mongoose.Types.ObjectId(user.id);
      }
      customerEmail = user.email || customerEmail;
      customerName = user.name || customerName;
      if (customerPhone && customerPhone.trim()) {
        const cleanP = customerPhone.trim();
        User.findOne({ phone: cleanP, _id: { $ne: user.id } }).then((existing) => {
          if (!existing) {
            User.findByIdAndUpdate(user.id, { $set: { phone: cleanP } }).catch(() => {});
          }
        }).catch(() => {});
      } else {
        const userDoc = await User.findById(user.id).select('phone').lean();
        if (userDoc?.phone) {
          customerPhone = userDoc.phone;
        }
      }
    }

    if (!customerEmail) {
      if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        customerEmail = `${cleanPhone || 'client'}@inquiry.cakepoprush.com`;
      } else {
        throw new ApiError(400, 'Customer email or phone number is required', 'EMAIL_REQUIRED');
      }
    }
    if (!customerName) {
      customerName = 'Valued Customer';
    }

    // Resolve product snapshot authoritatively if productId provided
    let productSnapshot = undefined;
    let source: 'GENERAL' | 'PRODUCT' = 'GENERAL';
    let customOrderType: 'general' | 'product' = 'general';

    if (payload.productId) {
      const resolved = resolveProductSnapshot(payload.productId);
      if (!resolved) {
        throw new ApiError(404, `Product '${payload.productId}' not found`, 'PRODUCT_NOT_FOUND');
      }
      productSnapshot = resolved;
      source = 'PRODUCT';
      customOrderType = 'product';
    }

    const targetDate = new Date(payload.targetDate);
    if (isNaN(targetDate.getTime())) {
      throw new ApiError(400, 'Invalid target date', 'INVALID_TARGET_DATE');
    }

    const quantity = parseInt(String(payload.quantity), 10) || 12;

    // Capture active published form version for historical form snapshot integrity
    let activeFormVersion = payload.formVersion;
    if (!activeFormVersion) {
      try {
        const activeConfig = await CustomOrderConfig.findOne({ status: 'published' })
          .sort({ version: -1 })
          .select('version')
          .lean() as { version?: number } | null;
        activeFormVersion = activeConfig?.version || 1;
      } catch {
        activeFormVersion = 1;
      }
    }

    const orderData: Partial<ICustomOrder> = {
      customer: customerId || undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      source,
      customOrderType,
      occasion: payload.occasion?.trim() || (productSnapshot ? 'Custom Product' : 'Custom'),
      occasionDescription: payload.occasionDescription?.trim() || '',
      targetDate,
      quantity,
      budget: payload.budget,
      designImage: payload.designImage || '',
      attachments: payload.attachments || [],
      productId: payload.productId || undefined,
      productSnapshot,
      customizationDetails: payload.customizationDetails || {},
      formVersion: activeFormVersion,
      status: 'Pending Quote',
      statusHistory: [
        {
          from: 'New',
          to: 'Pending Quote',
          changedBy: customerName,
          changedAt: new Date(),
          note: source === 'PRODUCT'
            ? `Product customization submitted for "${productSnapshot?.name}"`
            : 'Custom order request submitted',
        },
      ],
      isDraft: false,
    };

    // Deduplication check: Detect accidental rapid duplicate submissions within 15 seconds
    const fifteenSecondsAgo = new Date(Date.now() - 15000);
    const existingRecentOrder = await CustomOrder.findOne({
      customerEmail: customerEmail.trim().toLowerCase(),
      occasionDescription: payload.occasionDescription?.trim() || '',
      targetDate,
      quantity,
      createdAt: { $gte: fifteenSecondsAgo },
    });

    if (existingRecentOrder) {
      logger.info(`[CUSTOM ORDER] Idempotent response for duplicate submission: ${existingRecentOrder.orderId}`);
      return mapCustomOrderToDto(existingRecentOrder, { isStaff });
    }

    const order = await CustomOrder.create(orderData);
    logger.info(`[CUSTOM ORDER] Created ${order.orderId} for customer ${customerEmail} (Source: ${source}, Form: v${activeFormVersion})`);

    return mapCustomOrderToDto(order, { isStaff });
  }

  /**
   * Get custom orders for authenticated customer
   */
  static async getMyCustomOrders(userId: string) {
    if (!userId) {
      throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    let userEmail: string | undefined = undefined;
    if (isObjectId) {
      try {
        const u = await User.findById(userId).select('email').lean();
        if (u?.email) userEmail = u.email.toLowerCase();
      } catch {
        // Fallback silently if user lookup encounters an issue
      }
    }

    const conditions: any[] = [];
    if (isObjectId) {
      conditions.push({ customer: new mongoose.Types.ObjectId(userId) });
    }
    if (userEmail) {
      conditions.push({ customerEmail: userEmail });
    }

    if (conditions.length === 0) {
      return [];
    }

    const orders = await CustomOrder.find({
      $or: conditions,
      isDraft: { $ne: true },
      archived: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((o) => mapCustomOrderToDto(o as unknown as ICustomOrder, { isStaff: false }));
  }

  /**
   * Get single custom order with authorization check
   */
  static async getSingleCustomOrder(id: string, user?: JwtPayload) {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
    }

    if (!user) {
      throw new ApiError(401, 'Authentication required to view custom order', 'UNAUTHORIZED');
    }

    const cleanId = id.trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const order = await CustomOrder.findOne({
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(cleanId) }] : []),
        { orderId: cleanId },
      ],
    });

    if (!order) {
      throw new ApiError(404, 'Custom order not found', 'NOT_FOUND');
    }

    // Authorization: Must be staff OR the owning customer (by ID or verified email)
    const isStaff = (STAFF_ROLES as readonly string[]).includes(user.role);
    const isOwnerId = Boolean(order.customer && order.customer.toString() === user.id);
    const isOwnerEmail = Boolean(
      order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase()
    );
    const isOwner = isOwnerId || isOwnerEmail;

    if (!isStaff && !isOwner) {
      throw new ApiError(403, 'You are not authorized to view this custom order', 'FORBIDDEN');
    }

    return mapCustomOrderToDto(order, { isStaff });
  }

  /**
   * Edit custom order by customer (strict ownership + status validation)
   */
  static async updateCustomOrder(id: string, payload: any, user: JwtPayload) {
    if (!user?.id) {
      throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new ApiError(400, 'Valid custom order ID is required', 'INVALID_ID');
    }

    const cleanId = id.trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const order = await CustomOrder.findOne({
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(cleanId) }] : []),
        { orderId: cleanId },
      ],
    });

    if (!order) {
      throw new ApiError(404, 'Custom order not found', 'NOT_FOUND');
    }

    // Strict ownership verification: backend never trusts frontend
    const isOwnerId = Boolean(order.customer && order.customer.toString() === user.id);
    const isOwnerEmail = Boolean(
      order.customerEmail && user.email && order.customerEmail.toLowerCase() === user.email.toLowerCase()
    );
    if (!isOwnerId && !isOwnerEmail) {
      logger.warn(`[SECURITY] User ${user.id} attempted unauthorized edit of custom order ${order.orderId}`);
      throw new ApiError(403, 'You are not authorized to edit this custom order', 'FORBIDDEN');
    }

    // Status verification: Cannot edit after progression beyond Pending Quote
    if (order.status !== 'Pending Quote') {
      throw new ApiError(
        400,
        `Cannot edit custom order once it has progressed beyond initial review (Current status: ${order.status})`,
        'ORDER_LOCKED'
      );
    }

    // Permitted edits
    if (payload.occasionDescription !== undefined) {
      order.occasionDescription = payload.occasionDescription.trim();
    }
    if (payload.targetDate) {
      const parsedDate = new Date(payload.targetDate);
      if (!isNaN(parsedDate.getTime())) {
        order.targetDate = parsedDate;
      }
    }
    if (payload.quantity) {
      const q = parseInt(String(payload.quantity), 10);
      if (q >= 1) order.quantity = q;
    }
    if (payload.customerPhone !== undefined || payload.mobileNumber !== undefined) {
      order.customerPhone = (payload.customerPhone || payload.mobileNumber || '').trim();
    }
    if (payload.occasion !== undefined) {
      order.occasion = payload.occasion.trim();
    }
    if (payload.budget !== undefined) {
      order.budget = payload.budget;
    }
    if (payload.designImage !== undefined) {
      order.designImage = payload.designImage;
    }
    if (Array.isArray(payload.attachments)) {
      order.attachments = payload.attachments;
    }
    if (payload.customerName !== undefined && payload.customerName.trim()) {
      order.customerName = payload.customerName.trim();
    }
    if (payload.customizationDetails) {
      order.customizationDetails = {
        ...(order.customizationDetails || {}),
        ...payload.customizationDetails,
      };
      order.markModified('customizationDetails');
    }

    order.statusHistory.push({
      from: order.status,
      to: order.status,
      changedBy: user.name || 'Customer',
      changedAt: new Date(),
      note: 'Customer updated custom order requirements',
    });

    await order.save();
    logger.info(`[CUSTOM ORDER] Updated ${order.orderId} by customer ${user.email}`);

    const isStaff = (STAFF_ROLES as readonly string[]).includes(user.role);
    return mapCustomOrderToDto(order, { isStaff });
  }

  /**
   * Admin: List custom orders with pagination, search, and filtering
   */
  static async adminGetCustomOrders(queryParams: any) {
    const page = Math.max(1, parseInt(queryParams.page as string, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(queryParams.limit as string, 10) || 500));
    const skip = (page - 1) * limit;

    const filterQuery: Record<string, unknown> = {
      isDraft: { $ne: true },
    };

    if (queryParams.archived === 'true') {
      filterQuery.archived = true;
    } else {
      filterQuery.archived = false;
    }

    // Status filter
    if (queryParams.status && queryParams.status !== 'all') {
      const statusParam = String(queryParams.status).toLowerCase();
      if (statusParam === 'pending') {
        filterQuery.status = 'Pending Quote';
      } else if (statusParam === 'quoted') {
        filterQuery.status = 'Quoted';
      } else if (statusParam === 'approved') {
        filterQuery.status = 'Approved';
      } else if (statusParam === 'in_progress') {
        filterQuery.status = 'In Progress';
      } else if (statusParam === 'completed') {
        filterQuery.status = 'Completed';
      } else if (statusParam === 'rejected') {
        filterQuery.status = 'Rejected';
      } else {
        filterQuery.status = queryParams.status;
      }
    }

    // Occasion filter (safe regex escape with length limit)
    if (queryParams.occasion && queryParams.occasion !== 'all') {
      const occ = String(queryParams.occasion).trim().slice(0, 100);
      if (occ.toLowerCase() === 'custom') {
        filterQuery.occasion = { $regex: 'custom|other', $options: 'i' };
      } else {
        filterQuery.occasion = { $regex: escapeRegex(occ), $options: 'i' };
      }
    }

    // Order type filter
    if (queryParams.orderType && queryParams.orderType !== 'all') {
      filterQuery.customOrderType = String(queryParams.orderType).toLowerCase();
    }

    // Search query with regex escape and length cap to prevent ReDoS / Malicious regex
    if (queryParams.search && String(queryParams.search).trim()) {
      const s = escapeRegex(String(queryParams.search).trim().slice(0, 100));
      filterQuery.$or = [
        { orderId: { $regex: s, $options: 'i' } },
        { customerName: { $regex: s, $options: 'i' } },
        { customerEmail: { $regex: s, $options: 'i' } },
        { customerPhone: { $regex: s, $options: 'i' } },
        { occasion: { $regex: s, $options: 'i' } },
        { 'productSnapshot.name': { $regex: s, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      CustomOrder.find(filterQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CustomOrder.countDocuments(filterQuery),
    ]);

    const items = orders.map((o) => mapCustomOrderToDto(o as unknown as ICustomOrder, { isStaff: true }));

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Admin: Get aggregated statistics
   */
  static async adminGetStats() {
    const [totalRequests, pendingQuotes, approved, completed] = await Promise.all([
      CustomOrder.countDocuments({ isDraft: { $ne: true }, archived: { $ne: true } }),
      CustomOrder.countDocuments({ isDraft: { $ne: true }, archived: { $ne: true }, status: 'Pending Quote' }),
      CustomOrder.countDocuments({ isDraft: { $ne: true }, archived: { $ne: true }, status: 'Approved' }),
      CustomOrder.countDocuments({ isDraft: { $ne: true }, archived: { $ne: true }, status: 'Completed' }),
    ]);

    return [
      {
        id: 1,
        label: 'TOTAL REQUESTS',
        value: totalRequests.toLocaleString(),
        trend: '12.5%',
        isPositive: true,
        comparison: 'vs last 7 days',
        color: 'var(--admin-pink)',
        bg: '#FFF0F5',
      },
      {
        id: 2,
        label: 'PENDING QUOTES',
        value: pendingQuotes.toLocaleString(),
        trend: '8.2%',
        isPositive: false,
        comparison: 'vs last 7 days',
        color: '#F59E0B',
        bg: '#FFF8E1',
      },
      {
        id: 3,
        label: 'APPROVED',
        value: approved.toLocaleString(),
        trend: '18.4%',
        isPositive: true,
        comparison: 'vs last 7 days',
        color: 'var(--admin-cyan)',
        bg: '#E0FAFC',
      },
      {
        id: 4,
        label: 'COMPLETED',
        value: completed.toLocaleString(),
        trend: '24.5%',
        isPositive: true,
        comparison: 'vs last 7 days',
        color: '#10B981',
        bg: '#D1FAE5',
      },
    ];
  }

  /**
   * Admin: Update request status
   */
  static async adminUpdateStatus(
    id: string,
    newStatus: CustomOrderStatus,
    note?: string,
    adminUser?: JwtPayload
  ) {
    const cleanId = id.trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const order = await CustomOrder.findOne({
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(cleanId) }] : []),
        { orderId: cleanId },
      ],
    });

    if (!order) {
      throw new ApiError(404, 'Custom order not found', 'NOT_FOUND');
    }

    const prevStatus = order.status;
    order.status = newStatus;
    order.statusHistory.push({
      from: prevStatus,
      to: newStatus,
      changedBy: adminUser?.name || 'Admin',
      changedAt: new Date(),
      note: note || `Status updated from ${prevStatus} to ${newStatus}`,
    });

    await order.save();
    logger.info(`[ADMIN STATUS] Custom order ${order.orderId} status updated to ${newStatus} by ${adminUser?.email}`);

    await AdminAuditService.logAction({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      actorRole: adminUser?.role,
      entityType: 'CustomOrder',
      entityId: order.orderId || order._id.toString(),
      action: 'UPDATE_STATUS',
      previousValue: { status: prevStatus },
      newValue: { status: newStatus, note },
    });

    return mapCustomOrderToDto(order, { isStaff: true });
  }

  /**
   * Admin: Update notes
   */
  static async adminUpdateNotes(
    id: string,
    notes: { adminNotes?: string; internalNote?: string },
    adminUser?: JwtPayload
  ) {
    const cleanId = id.trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const order = await CustomOrder.findOne({
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(cleanId) }] : []),
        { orderId: cleanId },
      ],
    });

    if (!order) {
      throw new ApiError(404, 'Custom order not found', 'NOT_FOUND');
    }

    if (notes.adminNotes !== undefined) {
      order.adminNotes = notes.adminNotes;
    }

    if (notes.internalNote && notes.internalNote.trim()) {
      order.internalNotes.push({
        author: adminUser?.id || 'admin',
        authorName: adminUser?.name || 'Staff Member',
        text: notes.internalNote.trim(),
        createdAt: new Date(),
      });
    }

    await order.save();

    await AdminAuditService.logAction({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      actorRole: adminUser?.role,
      entityType: 'CustomOrder',
      entityId: order.orderId || order._id.toString(),
      action: 'UPDATE_NOTES',
      newValue: notes,
    });

    return mapCustomOrderToDto(order, { isStaff: true });
  }

  /**
   * Admin: Delete or archive order
   */
  static async adminDeleteOrder(id: string, adminUser?: JwtPayload) {
    const cleanId = id.trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const order = await CustomOrder.findOneAndDelete({
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(cleanId) }] : []),
        { orderId: cleanId },
      ],
    });

    if (!order) {
      throw new ApiError(404, 'Custom order not found', 'NOT_FOUND');
    }

    logger.info(`[ADMIN DELETE] Deleted custom order ${order.orderId}`);

    await AdminAuditService.logAction({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      actorRole: adminUser?.role,
      entityType: 'CustomOrder',
      entityId: order.orderId || order._id.toString(),
      action: 'DELETE_ORDER',
      previousValue: { orderId: order.orderId, customerEmail: order.customerEmail },
    });

    return { success: true, message: `Custom order ${order.orderId} deleted successfully` };
  }

  /**
   * Get public storefront custom order form configuration
   */
  static async getConfig() {
    try {
      const config = await CustomOrderConfig.findOne({ status: 'published' }).sort({ version: -1 });
      if (config) {
        return config.toObject();
      }
    } catch (err) {
      logger.warn('[CUSTOM ORDER CONFIG] Error fetching published config from DB, using fallback defaults', err);
    }
    return DEFAULT_CAKEPOPRUSH_CONFIG;
  }

  /**
   * Admin: Get latest draft or published form configuration
   */
  static async getAdminConfig() {
    try {
      const draft = await CustomOrderConfig.findOne({ status: 'draft' }).sort({ updatedAt: -1 });
      if (draft) {
        return draft.toObject();
      }
      const published = await CustomOrderConfig.findOne({ status: 'published' }).sort({ version: -1 });
      if (published) {
        return published.toObject();
      }
    } catch (err) {
      logger.warn('[CUSTOM ORDER CONFIG] Error fetching admin config from DB, using fallback defaults', err);
    }
    return DEFAULT_CAKEPOPRUSH_CONFIG;
  }

  /**
   * Admin: Save custom order configuration draft
   */
  static async saveConfigDraft(content: any, user?: JwtPayload) {
    if (!content || !Array.isArray(content.types)) {
      throw new ApiError(400, 'Invalid configuration format: types array is required', 'INVALID_CONFIG');
    }

    let draft = await CustomOrderConfig.findOne({ status: 'draft' });
    if (!draft) {
      const latest = await CustomOrderConfig.findOne().sort({ version: -1 });
      const nextVersion = (latest?.version || 1);
      draft = new CustomOrderConfig({
        version: nextVersion,
        status: 'draft',
        types: content.types,
      });
    } else {
      draft.types = content.types;
      draft.markModified('types');
    }

    await draft.save();
    logger.info(`[CUSTOM ORDER CONFIG] Draft saved by ${user?.email || 'admin'}`);
    return draft.toObject();
  }

  /**
   * Admin: Publish configuration live
   */
  static async publishConfig(content: any, user?: JwtPayload) {
    if (!content || !Array.isArray(content.types)) {
      throw new ApiError(400, 'Invalid configuration format: types array is required', 'INVALID_CONFIG');
    }

    const latestPublished = await CustomOrderConfig.findOne({ status: 'published' }).sort({ version: -1 });
    const newVersion = (latestPublished?.version || 0) + 1;

    // Delete any draft once published
    await CustomOrderConfig.deleteMany({ status: 'draft' });

    const published = await CustomOrderConfig.create({
      version: newVersion,
      status: 'published',
      types: content.types,
      publishedAt: new Date(),
      publishedBy: user?.email || user?.name || 'Admin',
    });

    logger.info(`[CUSTOM ORDER CONFIG] Version ${newVersion} published live by ${user?.email || 'admin'}`);

    await AdminAuditService.logAction({
      actorId: user?.id,
      actorEmail: user?.email,
      actorRole: user?.role,
      entityType: 'CustomOrderConfig',
      entityId: `v${newVersion}`,
      action: 'PUBLISH_CONFIG',
      newValue: { version: newVersion, typesCount: content.types.length },
    });

    return published.toObject();
  }
}

