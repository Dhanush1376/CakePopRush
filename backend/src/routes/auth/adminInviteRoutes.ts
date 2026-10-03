import { Router } from 'express';
import {
  createAdminInvite,
  resendAdminInvite,
  getPendingInvites,
  getInviteHistory,
  revokeAdminInvite,
  getInviteDetailsByToken,
  acceptAdminInvite,
  declineAdminInvite,
  getMyPendingInvite,
  respondToAdminInvite,
} from '../../controllers/auth/adminInviteController';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/zodValidationMiddleware';
import {
  adminInviteSchema,
  adminInviteResponseSchema,
  acceptAdminInviteSchema,
} from '../../validators/authSchema';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

// ── Public Invitation Verification ──
router.get('/details', authLimiter, getInviteDetailsByToken);
router.post('/decline', authLimiter, declineAdminInvite);

// ── Authenticated User Actions ──
router.get('/my-pending', requireAuth, getMyPendingInvite);
router.post('/accept', requireAuth, authLimiter, validateRequest(acceptAdminInviteSchema), acceptAdminInvite);
router.post('/respond', requireAuth, authLimiter, validateRequest(adminInviteResponseSchema), respondToAdminInvite);

// ── Administrative Workspace Actions (Requires Authenticated Admin) ──
router.post('/', requireAuth, requireAdmin, authLimiter, validateRequest(adminInviteSchema), createAdminInvite);
router.get('/pending', requireAuth, requireAdmin, getPendingInvites);
router.get('/history', requireAuth, requireAdmin, getInviteHistory);
router.post('/:id/resend', requireAuth, requireAdmin, authLimiter, resendAdminInvite);
router.delete('/:id/revoke', requireAuth, requireAdmin, authLimiter, revokeAdminInvite);

export default router;
