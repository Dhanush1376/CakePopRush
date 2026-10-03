import User, { IUser } from '../models/User';
import AdminInvite from '../models/AdminInvite';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';
import {
  STAFF_ROLES,
  ROLE_HIERARCHY,
  canActorManageTarget,
  canActorAssignRole,
  isProtectedSuperAdminEmail,
} from '../config/adminConfig';
import AdminAuditService from './AdminAuditService';

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
  return 'CP';
};

const getAvatarTheme = (role: string) => {
  switch (role) {
    case 'super_admin':
      return { avatarBg: '#FFF0F5', avatarColor: '#FF69B4' }; // Pink
    case 'admin':
      return { avatarBg: '#FFF8E1', avatarColor: '#F59E0B' }; // Amber
    case 'editor':
      return { avatarBg: '#E0FAFC', avatarColor: '#00BCD4' }; // Cyan
    case 'viewer':
      return { avatarBg: '#F3E5F5', avatarColor: '#AB47BC' }; // Purple
    case 'delivery_agent':
    case 'DELIVERY_AGENT':
      return { avatarBg: '#E8F5E9', avatarColor: '#2E7D32' }; // Green
    default:
      return { avatarBg: '#F5F5F5', avatarColor: '#757575' }; // Neutral
  }
};

const formatRoleDisplay = (role: string): string => {
  switch (role) {
    case 'super_admin':
    case 'owner':
      return 'Super Admin';
    case 'main_admin':
    case 'admin':
      return 'Administrator';
    case 'editor':
      return 'Editor';
    case 'viewer':
      return 'Viewer';
    case 'delivery_agent':
    case 'DELIVERY_AGENT':
      return 'Delivery Agent';
    default:
      return 'Customer';
  }
};

const formatDateFields = (date?: Date) => {
  if (!date) {
    return { date: '—', time: '—' };
  }
  const d = new Date(date);
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

export class AdminUserService {
  /**
   * Server-side paginated, searchable, and filterable list of users.
   */
  static async getUsers(options: {
    actorId: string;
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { actorId, search, role, status, page = 1, limit = 10 } = options;
    const skip = (Math.max(1, page) - 1) * limit;

    const query: any = {};

    // Search query across name, email, and phone
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    // Role filtering - by default, only staff roles are queried for the admin user management portal
    if (role && role !== 'all') {
      const r = role.toLowerCase();
      if (r === 'superadmin' || r === 'super_admin') {
        query.role = { $in: ['super_admin', 'owner'] };
      } else if (r === 'admin' || r === 'administrator') {
        query.role = { $in: ['admin', 'main_admin'] };
      } else if (r === 'editor') {
        query.role = 'editor';
      } else if (r === 'viewer') {
        query.role = 'viewer';
      } else if (r === 'delivery_agent' || r === 'delivery' || r === 'delivery agent') {
        query.role = { $in: ['delivery_agent', 'DELIVERY_AGENT'] };
      } else if (r === 'customer') {
        query.role = { $in: ['customer', 'user'] };
      } else {
        query.role = role;
      }
    } else {
      query.role = { $in: [...STAFF_ROLES, 'delivery_agent', 'DELIVERY_AGENT'] };
    }

    // Status filtering
    if (status && status !== 'all') {
      const s = status.toLowerCase();
      if (s === 'active') {
        query.isLocked = { $ne: true };
      } else if (s === 'inactive') {
        query.isLocked = true;
      }
    }

    const [users, totalCount] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const formattedUsers = users.map((u: any) => {
      const theme = getAvatarTheme(u.role);
      const login = formatDateFields(u.lastLogin);
      const joined = formatDateFields(u.createdAt);
      const isYou = String(u._id) === String(actorId);

      return {
        id: String(u._id),
        _id: String(u._id),
        name: u.name || 'Admin User',
        email: u.email || '—',
        phone: u.phone || '—',
        role: formatRoleDisplay(u.role),
        rawRole: u.role,
        status: u.isLocked ? 'Inactive' : 'Active',
        isLocked: Boolean(u.isLocked),
        initials: getInitials(u.name, u.email),
        avatarBg: theme.avatarBg,
        avatarColor: theme.avatarColor,
        avatar: u.avatar || null,
        isYou,
        lastLoginDate: login.date,
        lastLoginTime: login.time,
        joinDate: joined.date,
        joinTime: joined.time,
        createdAt: u.createdAt,
      };
    });

    return {
      users: formattedUsers,
      total: totalCount,
      totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves administrative KPI stats.
   */
  static async getUserStats() {
    const [totalAdmins, activeAdmins, administrators, editors, superAdmins, pendingInvites] =
      await Promise.all([
        User.countDocuments({ role: { $in: STAFF_ROLES } }),
        User.countDocuments({ role: { $in: STAFF_ROLES }, isLocked: { $ne: true } }),
        User.countDocuments({ role: { $in: ['admin', 'main_admin'] } }),
        User.countDocuments({ role: 'editor' }),
        User.countDocuments({ role: { $in: ['super_admin', 'owner'] } }),
        AdminInvite.countDocuments({ status: 'pending' }),
      ]);

    return [
      {
        id: 1,
        label: 'TOTAL ADMINS',
        value: String(totalAdmins),
        trend: `${totalAdmins}`,
        isPositive: true,
        isNeutral: false,
        color: 'var(--admin-pink)',
        bg: '#FFF0F5',
      },
      {
        id: 2,
        label: 'ACTIVE ADMINS',
        value: String(activeAdmins),
        trend: `${activeAdmins}`,
        isPositive: true,
        isNeutral: false,
        color: '#F59E0B',
        bg: '#FFF8E1',
      },
      {
        id: 3,
        label: 'ADMINISTRATORS',
        value: String(administrators),
        trend: `${administrators}`,
        isPositive: true,
        isNeutral: false,
        color: 'var(--admin-cyan)',
        bg: '#E0FAFC',
      },
      {
        id: 4,
        label: 'EDITORS',
        value: String(editors),
        trend: `${editors}`,
        isPositive: true,
        isNeutral: false,
        color: 'var(--admin-purple)',
        bg: '#F3E5F5',
      },
      {
        id: 5,
        label: 'SUPER ADMINS',
        value: String(superAdmins),
        trend: `${superAdmins}`,
        isPositive: true,
        isNeutral: false,
        color: '#5C3317',
        bg: '#F5F5DC',
      },
    ];
  }

  /**
   * Updates an administrator's role with strict hierarchy enforcement.
   */
  static async updateUserRole(actorId: string, actorRole: string, targetUserId: string, newRole: string) {
    if (String(actorId) === String(targetUserId)) {
      throw new ApiError(400, 'Self-role modification is forbidden. You cannot change your own role.');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    if (isProtectedSuperAdminEmail(targetUser.email)) {
      throw new ApiError(403, 'Forbidden: The primary configured Super Admin account cannot be modified or demoted.');
    }

    if (!canActorManageTarget(actorRole, targetUser.role)) {
      throw new ApiError(
        403,
        `Permission denied: Your clearance (${actorRole}) is insufficient to manage this user (Role: "${targetUser.role}").`
      );
    }

    // Map UI role values to standard schema enum
    let normalizedRole = newRole.toLowerCase();
    if (normalizedRole === 'superadmin' || normalizedRole === 'super admin') normalizedRole = 'super_admin';
    if (normalizedRole === 'administrator') normalizedRole = 'admin';
    if (normalizedRole === 'delivery agent' || normalizedRole === 'deliveryagent' || normalizedRole === 'delivery-agent') normalizedRole = 'delivery_agent';

    if (!canActorAssignRole(actorRole, normalizedRole)) {
      throw new ApiError(
        403,
        `Privilege escalation blocked: You do not have permission to assign the role "${normalizedRole}".`
      );
    }

    const previousRole = targetUser.role;
    targetUser.role = normalizedRole as any;
    targetUser.passwordChangedAt = new Date();
    await targetUser.save();

    await AdminAuditService.logAction({
      actorId,
      actorRole,
      entityType: 'User',
      entityId: String(targetUser._id),
      action: 'role_updated',
      previousValue: { role: previousRole },
      newValue: { role: normalizedRole },
    });

    logger.info(`[ADMIN ROLE] User ${targetUserId} role updated from ${previousRole} to ${normalizedRole} by ${actorId}`);
    return targetUser;
  }

  /**
   * Updates an administrator's status (Active / Inactive).
   */
  static async updateUserStatus(actorId: string, actorRole: string, targetUserId: string, status: 'active' | 'inactive') {
    if (String(actorId) === String(targetUserId)) {
      throw new ApiError(400, 'Self-deactivation is forbidden. You cannot lock your own account.');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    if (isProtectedSuperAdminEmail(targetUser.email)) {
      throw new ApiError(403, 'Forbidden: The primary configured Super Admin cannot be deactivated.');
    }

    if (!canActorManageTarget(actorRole, targetUser.role)) {
      throw new ApiError(
        403,
        `Permission denied: Your clearance (${actorRole}) is insufficient to change status for role "${targetUser.role}".`
      );
    }

    const isLocked = status.toLowerCase() === 'inactive';
    targetUser.isLocked = isLocked;
    if (isLocked) {
      targetUser.passwordChangedAt = new Date(); // Revokes active JWT sessions
    }
    await targetUser.save();

    await AdminAuditService.logAction({
      actorId,
      actorRole,
      entityType: 'User',
      entityId: String(targetUser._id),
      action: isLocked ? 'admin_deactivated' : 'admin_reactivated',
      newValue: { isLocked },
    });

    logger.info(`[ADMIN STATUS] User ${targetUserId} status set to ${status} by actor ${actorId}`);
    return targetUser;
  }

  /**
   * Revokes admin privileges / downgrades user to customer status.
   */
  static async removeAdmin(actorId: string, actorRole: string, targetUserId: string) {
    if (String(actorId) === String(targetUserId)) {
      throw new ApiError(400, 'Self-revocation is forbidden. You cannot remove your own admin access.');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    if (isProtectedSuperAdminEmail(targetUser.email)) {
      throw new ApiError(403, 'Forbidden: The primary configured Super Admin cannot be removed.');
    }

    if (!canActorManageTarget(actorRole, targetUser.role)) {
      throw new ApiError(
        403,
        `Permission denied: You do not have clearance to remove users with role "${targetUser.role}".`
      );
    }

    const previousRole = targetUser.role;
    targetUser.role = 'customer';
    targetUser.passwordChangedAt = new Date();
    await targetUser.save();

    await AdminAuditService.logAction({
      actorId,
      actorRole,
      entityType: 'User',
      entityId: String(targetUser._id),
      action: 'admin_removed',
      previousValue: { role: previousRole },
      newValue: { role: 'customer' },
    });

    logger.info(`[ADMIN REMOVAL] User ${targetUserId} downgraded from ${previousRole} to customer by ${actorId}`);
    return targetUser;
  }
}

export default AdminUserService;
