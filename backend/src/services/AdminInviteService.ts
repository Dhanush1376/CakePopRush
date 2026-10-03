import crypto from 'crypto';
import User from '../models/User';
import AdminInvite from '../models/AdminInvite';
import logger from '../config/logger';
import { canonicalizeEmail } from '../utils/email/emailHelper';
import { canActorManageTarget, canActorAssignRole, isProtectedSuperAdminEmail } from '../config/adminConfig';
import ApiError from '../utils/ApiError';
import EmailService from './EmailService';
import AdminAuditService from './AdminAuditService';

export class AdminInviteService {
  /**
   * Creates a secure admin invitation with a cryptographically random token.
   * Token is hashed with SHA-256 before storage in the database.
   */
  static async createInvite(
    actorId: string,
    actorRole: string,
    email: string,
    role: string,
    permissionsSummary?: string
  ) {
    const cleanEmail = canonicalizeEmail(email);
    if (!cleanEmail) {
      throw new ApiError(400, 'A valid email address is required');
    }

    if (!role) {
      throw new ApiError(400, 'A role must be assigned to the invitation');
    }

    // Role assignment hierarchy check
    if (!canActorAssignRole(actorRole, role)) {
      throw new ApiError(
        403,
        `Privilege escalation blocked: Your current role (${actorRole}) cannot assign the role "${role}".`
      );
    }

    // Check target user if already registered
    const targetUser = await User.findOne({ email: cleanEmail });
    if (targetUser) {
      if (String(targetUser._id) === String(actorId)) {
        throw new ApiError(400, 'You cannot invite yourself or modify your own role via invitations.');
      }

      if (isProtectedSuperAdminEmail(targetUser.email)) {
        throw new ApiError(403, 'The configured Super Admin account cannot be reinvited or modified.');
      }

      if (targetUser.role === role) {
        throw new ApiError(400, `User "${cleanEmail}" is already an active member with the role "${role}".`);
      }

      if (!canActorManageTarget(actorRole, targetUser.role)) {
        throw new ApiError(
          403,
          `Permission denied: You cannot manage a user who holds the role "${targetUser.role}".`
        );
      }
    }

    // Revoke any existing pending invitations for this email to avoid duplicates
    await AdminInvite.updateMany(
      { email: cleanEmail, status: 'pending' },
      { status: 'revoked', revokedAt: new Date() }
    );

    // Generate cryptographically random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await AdminInvite.create({
      email: cleanEmail,
      roleAssigned: role as any,
      permissionsSummary: permissionsSummary || 'Access Admin Portal & Dashboard',
      status: 'pending',
      tokenHash,
      expiresAt,
      invitedBy: actorId,
      invitedUser: targetUser?._id,
    });

    const actor = await User.findById(actorId).select('name email role');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptUrl = `${frontendUrl}/accept-invite?token=${rawToken}`;

    // Send invitation email
    await EmailService.sendAdminInviteEmail({
      toEmail: cleanEmail,
      role,
      acceptUrl,
      inviterName: actor?.name || undefined,
    });

    // Audit log
    await AdminAuditService.logAction({
      actorId,
      actorEmail: actor?.email,
      actorRole,
      entityType: 'AdminInvite',
      entityId: String(invite._id),
      action: 'invite_created',
      newValue: { email: cleanEmail, roleAssigned: role, expiresAt },
    });

    logger.info(`[ADMIN INVITE] Created invitation for ${cleanEmail} as ${role} by actor ${actorId}`);

    // Return sanitized invite with token attached for immediate dev/test response
    const inviteObj = invite.toObject();
    return {
      ...inviteObj,
      rawToken, // Provided in creation response so automated integration tests and dispatch callers can use it
      acceptUrl,
    };
  }

  /**
   * Resend an invitation with a fresh token and expiration.
   */
  static async resendInvite(inviteId: string, actorId: string, actorRole: string) {
    const invite = await AdminInvite.findById(inviteId);
    if (!invite) {
      throw new ApiError(404, 'Invitation not found');
    }

    if (invite.status !== 'pending') {
      throw new ApiError(400, `Only pending invitations can be resent. Current status: "${invite.status}".`);
    }

    if (!canActorAssignRole(actorRole, invite.roleAssigned)) {
      throw new ApiError(403, 'You do not have permission to resend invitations for this role.');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    invite.tokenHash = tokenHash;
    invite.expiresAt = expiresAt;
    await invite.save();

    const actor = await User.findById(actorId).select('name email role');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptUrl = `${frontendUrl}/accept-invite?token=${rawToken}`;

    await EmailService.sendAdminInviteEmail({
      toEmail: invite.email,
      role: invite.roleAssigned,
      acceptUrl,
      inviterName: actor?.name || undefined,
    });

    await AdminAuditService.logAction({
      actorId,
      actorEmail: actor?.email,
      actorRole,
      entityType: 'AdminInvite',
      entityId: String(invite._id),
      action: 'invite_resent',
      newValue: { email: invite.email, expiresAt },
    });

    logger.info(`[ADMIN INVITE] Resent invitation ${inviteId} to ${invite.email} by actor ${actorId}`);

    return {
      ...invite.toObject(),
      rawToken,
      acceptUrl,
    };
  }

  /**
   * Revokes a pending invitation.
   */
  static async revokeInvite(id: string, actorId: string, actorRole: string) {
    const invite = await AdminInvite.findById(id);
    if (!invite) {
      throw new ApiError(404, 'Invitation not found');
    }

    if (invite.status !== 'pending') {
      throw new ApiError(400, `Only pending invitations can be revoked. Current status: "${invite.status}".`);
    }

    if (!canActorAssignRole(actorRole, invite.roleAssigned)) {
      throw new ApiError(403, 'You do not have permission to revoke invitations for this role.');
    }

    invite.status = 'revoked';
    invite.revokedAt = new Date();
    await invite.save();

    await AdminAuditService.logAction({
      actorId,
      actorRole,
      entityType: 'AdminInvite',
      entityId: String(invite._id),
      action: 'invite_revoked',
      previousValue: { status: 'pending' },
      newValue: { status: 'revoked', revokedAt: invite.revokedAt },
    });

    logger.info(`[ADMIN INVITE] Invitation ${id} revoked by actor ${actorId}`);
    return invite;
  }

  /**
   * Retrieves public details of an invitation by its raw token (for the accept page).
   */
  static async getInviteDetailsByToken(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new ApiError(400, 'Invitation token is required');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    const invite = await AdminInvite.findOne({ tokenHash }).populate('invitedBy', 'name email');

    if (!invite) {
      throw new ApiError(404, 'Invalid or expired invitation token');
    }

    if (invite.status !== 'pending') {
      throw new ApiError(400, `This invitation has already been ${invite.status}.`);
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new ApiError(400, 'This invitation has expired.');
    }

    return {
      id: String(invite._id),
      email: invite.email,
      roleAssigned: invite.roleAssigned,
      permissionsSummary: invite.permissionsSummary,
      expiresAt: invite.expiresAt,
      status: invite.status,
      invitedBy: invite.invitedBy,
      createdAt: invite.createdAt,
    };
  }

  /**
   * Accepts an invitation using a raw token and an authenticated user.
   * Strictly enforces email matching between the authenticated user and the invitation recipient.
   */
  static async acceptInvite(rawToken: string, authenticatedUserId: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new ApiError(400, 'Invitation token is required');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    const invite = await AdminInvite.findOne({ tokenHash, status: 'pending' });

    if (!invite) {
      throw new ApiError(404, 'Invalid, expired, or already-processed invitation token');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new ApiError(400, 'This invitation link has expired and cannot be accepted.');
    }

    const user = await User.findById(authenticatedUserId);
    if (!user) {
      throw new ApiError(404, 'User account not found');
    }

    // Email Identity Matching
    const cleanUserEmail = canonicalizeEmail(user.email || '');
    const cleanInviteEmail = canonicalizeEmail(invite.email);

    if (cleanUserEmail !== cleanInviteEmail) {
      throw new ApiError(
        403,
        `Email mismatch: This invitation was issued for "${invite.email}", but your authenticated account is "${user.email}". Please log in with the correct account to accept.`
      );
    }

    const previousRole = user.role;
    user.role = invite.roleAssigned;
    user.isVerified = true;
    user.emailVerified = true;
    await user.save();

    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    invite.acceptedBy = user._id;
    invite.invitedUser = user._id;
    await invite.save();

    await AdminAuditService.logAction({
      actorId: String(user._id),
      actorEmail: user.email,
      actorRole: user.role,
      entityType: 'AdminInvite',
      entityId: String(invite._id),
      action: 'invite_accepted',
      previousValue: { role: previousRole, status: 'pending' },
      newValue: { role: invite.roleAssigned, status: 'accepted' },
    });

    logger.info(`[ADMIN INVITE ACCEPTED] User ${user._id} (${cleanUserEmail}) elevated from ${previousRole} to ${invite.roleAssigned}`);

    return {
      status: 'accepted',
      role: invite.roleAssigned,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Declines an invitation by token.
   */
  static async declineInvite(rawToken: string, userId?: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new ApiError(400, 'Invitation token is required');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
    const invite = await AdminInvite.findOne({ tokenHash, status: 'pending' });

    if (!invite) {
      throw new ApiError(404, 'Invalid, expired, or already-processed invitation');
    }

    invite.status = 'rejected';
    invite.rejectedAt = new Date();
    await invite.save();

    logger.info(`[ADMIN INVITE DECLINED] Invitation for ${invite.email} declined`);
    return { status: 'rejected' };
  }

  /**
   * Retrieves pending invitations with pagination.
   */
  static async getPendingInvites(skip: number = 0, limit: number = 20) {
    const [invites, totalCount] = await Promise.all([
      AdminInvite.find({ status: 'pending' })
        .populate('invitedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminInvite.countDocuments({ status: 'pending' }),
    ]);

    const formatted = invites.map((inv) => ({
      id: String(inv._id),
      email: inv.email,
      roleAssigned: inv.roleAssigned,
      permissionsSummary: inv.permissionsSummary,
      status: inv.status,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      invitedBy: inv.invitedBy,
    }));

    return { invites: formatted, totalCount };
  }

  /**
   * Retrieves invitation history logs with pagination.
   */
  static async getInviteHistory(skip: number = 0, limit: number = 20) {
    const [invites, totalCount] = await Promise.all([
      AdminInvite.find()
        .populate('invitedBy', 'name email role')
        .populate('acceptedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminInvite.countDocuments(),
    ]);

    const formatted = invites.map((inv) => ({
      id: String(inv._id),
      email: inv.email,
      roleAssigned: inv.roleAssigned,
      permissionsSummary: inv.permissionsSummary,
      status: inv.status,
      expiresAt: inv.expiresAt,
      acceptedAt: inv.acceptedAt,
      rejectedAt: inv.rejectedAt,
      revokedAt: inv.revokedAt,
      createdAt: inv.createdAt,
      invitedBy: inv.invitedBy,
      acceptedBy: inv.acceptedBy,
    }));

    return { invites: formatted, totalCount };
  }

  /**
   * Checks if an authenticated user has a pending invitation matching their email.
   */
  static async getMyPendingInvite(userEmail: string) {
    if (!userEmail) return null;
    const cleanEmail = canonicalizeEmail(userEmail);
    return AdminInvite.findOne({
      email: cleanEmail,
      status: 'pending',
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: { $exists: false } },
        { expiresAt: null },
      ],
    })
      .populate('invitedBy', 'name email role')
      .sort({ createdAt: -1 });
  }
}

export default AdminInviteService;
