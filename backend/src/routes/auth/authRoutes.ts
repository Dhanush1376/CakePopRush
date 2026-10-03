import { Router } from 'express';
import {
  requestUnifiedOtp,
  verifyOtp,
  googleAuth,
  refreshSession,
  logout,
  getProfile,
} from '../../controllers/auth/authController';
import { requireAuth } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/zodValidationMiddleware';
import {
  requestOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
  refreshSessionSchema,
} from '../../validators/authSchema';
import { otpSendLimiter, otpVerifyLimiter, authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/request-otp', otpSendLimiter, validateRequest(requestOtpSchema), requestUnifiedOtp);
router.post('/verify-otp', otpVerifyLimiter, validateRequest(verifyOtpSchema), verifyOtp);
router.post('/google', authLimiter, validateRequest(googleAuthSchema), googleAuth);
router.post('/refresh', authLimiter, validateRequest(refreshSessionSchema), refreshSession);
router.post('/logout', authLimiter, logout);
router.get('/profile', requireAuth, getProfile);

export default router;
