import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import AdminInviteService from '../../services/AdminInviteService';
import AdminAuditService from '../../services/AdminAuditService';
import User from '../../models/User';
import AdminInvite from '../../models/AdminInvite';
import { canonicalizeEmail } from '../../utils/email/emailHelper';

export const createAdminInvite = asyncHandler(async (req: Request, res: Response) => {
  const { email, role, permissionsSummary } = req.body;
  const actorId = req.user!.id;
  const actorRole = req.user!.role;

  if (!email || !role) {
    throw new ApiError(400, 'Email and Role are required');
  }

  const invite = await AdminInviteService.createInvite(
    actorId,
    actorRole,
    email,
    role,
    permissionsSummary
  );

  res.status(201).json(new ApiResponse(true, 'Admin invitation dispatched successfully', invite));
});

export const resendAdminInvite = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actorId = req.user!.id;
  const actorRole = req.user!.role;

  const result = await AdminInviteService.resendInvite(id, actorId, actorRole);
  res.status(200).json(new ApiResponse(true, 'Admin invitation resent successfully', result));
});

export const getPendingInvites = asyncHandler(async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string, 10) || 0;
  const limit = parseInt(req.query.limit as string, 10) || 50;

  const result = await AdminInviteService.getPendingInvites(skip, limit);
  res.status(200).json(new ApiResponse(true, 'Pending admin invitations retrieved', result));
});

export const getInviteHistory = asyncHandler(async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string, 10) || 0;
  const limit = parseInt(req.query.limit as string, 10) || 50;

  const result = await AdminInviteService.getInviteHistory(skip, limit);
  res.status(200).json(new ApiResponse(true, 'Invitation history retrieved', result));
});

export const revokeAdminInvite = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const actorId = req.user!.id;
  const actorRole = req.user!.role;

  const invite = await AdminInviteService.revokeInvite(id, actorId, actorRole);
  res.status(200).json(new ApiResponse(true, 'Invitation revoked successfully', invite));
});

export const getInviteDetailsByToken = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.query.token as string) || (req.params.token as string);
  if (!token) {
    throw new ApiError(400, 'Invitation token is required');
  }

  const details = await AdminInviteService.getInviteDetailsByToken(token);
  res.status(200).json(new ApiResponse(true, 'Invitation details loaded', details));
});

export const acceptAdminInvite = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user!.id;

  if (!token) {
    throw new ApiError(400, 'Invitation token is required');
  }

  const result = await AdminInviteService.acceptInvite(token, userId);
  res.status(200).json(
    new ApiResponse(
      true,
      `Welcome to the team! You have successfully accepted the invitation and are now a ${result.role}.`,
      result
    )
  );
});

export const declineAdminInvite = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user?.id;

  if (!token) {
    throw new ApiError(400, 'Invitation token is required');
  }

  const result = await AdminInviteService.declineInvite(token, userId);
  res.status(200).json(new ApiResponse(true, 'Invitation declined successfully', result));
});

export const getMyPendingInvite = asyncHandler(async (req: Request, res: Response) => {
  const userEmail = req.user?.email || '';
  if (!userEmail) {
    return res.status(200).json(new ApiResponse(true, 'No pending invitation', null));
  }
  const invite = await AdminInviteService.getMyPendingInvite(userEmail);

  res.status(200).json(
    new ApiResponse(true, invite ? 'Pending invitation found' : 'No pending invitation', invite)
  );
});

export const respondToAdminInvite = asyncHandler(async (req: Request, res: Response) => {
  const { inviteId, action, token } = req.body;
  const userId = req.user!.id;

  if (inviteId) {
    const invite = await AdminInvite.findOne({ _id: inviteId, status: 'pending' });
    if (!invite) throw new ApiError(404, 'No pending invitation found matching the given ID');

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User account not found');

    if (user.email && canonicalizeEmail(user.email) !== canonicalizeEmail(invite.email)) {
      throw new ApiError(403, 'This invitation was issued to a different email address');
    }

    if (action === 'accept') {
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

      return res.status(200).json(
        new ApiResponse(true, `Invitation accepted successfully`, {
          status: 'accepted',
          role: invite.roleAssigned,
          user: {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
          },
        })
      );
    } else {
      invite.status = 'rejected';
      invite.rejectedAt = new Date();
      await invite.save();

      await AdminAuditService.logAction({
        actorId: String(userId),
        actorEmail: user.email,
        actorRole: user.role,
        entityType: 'AdminInvite',
        entityId: String(invite._id),
        action: 'invite_rejected',
        newValue: { status: 'rejected' },
      });

      return res.status(200).json(new ApiResponse(true, 'Invitation rejected', { status: 'rejected' }));
    }
  }

  if (token) {
    if (action === 'reject' || action === 'declined') {
      const result = await AdminInviteService.declineInvite(token, userId);
      return res.status(200).json(new ApiResponse(true, 'Invitation declined', result));
    }
    const result = await AdminInviteService.acceptInvite(token, userId);
    return res.status(200).json(new ApiResponse(true, 'Invitation accepted', result));
  }

  throw new ApiError(400, 'inviteId or token is required');
});
