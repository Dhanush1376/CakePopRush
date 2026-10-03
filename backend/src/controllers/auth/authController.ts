import { Request, Response } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import logger from '../../config/logger';
import User from '../../models/User';
import OtpChallenge from '../../models/OtpChallenge';
import OtpAuthService from '../../services/OtpAuthService';
import PhoneAuthService from '../../services/PhoneAuthService';
import GoogleAuthService from '../../services/GoogleAuthService';
import SessionAuthService from '../../services/SessionAuthService';
import {
  CUSTOMER_REFRESH_COOKIE,
  ADMIN_REFRESH_COOKIE,
  setCustomerRefreshCookie,
  setAdminRefreshCookie,
  clearCustomerRefreshCookie,
  clearAdminRefreshCookie,
} from '../../utils/security/authCookies';
import { isAdministrativeRole, getSuperAdminEmail } from '../../config/adminConfig';
import { invalidateUserSessionCaches } from '../../utils/security/userCache';
import {
  checkOtpSendAllowed,
  isOtpVerifyBlocked,
  recordOtpVerifyFailure,
  clearOtpVerifyFailures,
} from '../../utils/security/otpRateLimit';

export const requestUnifiedOtp = asyncHandler(async (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    throw new ApiError(400, 'Email or mobile number is required');
  }

  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!(await checkOtpSendAllowed(clientIp))) {
    throw new ApiError(429, 'Too many OTP requests. Please wait before trying again.', 'RATE_LIMIT_EXCEEDED');
  }

  let challengeId: string;

  if (identifier.includes('@')) {
    logger.info(`[AUTH] Requesting OTP for email from ${clientIp}`);
    const result = await OtpAuthService.generateOTP(identifier, clientIp);
    challengeId = result.challengeId;
  } else {
    logger.info(`[AUTH] Requesting OTP for phone from ${clientIp}`);
    const result = await PhoneAuthService.requestOtp(identifier, clientIp);
    challengeId = result.challengeId;
  }

  res.status(200).json(
    new ApiResponse(true, 'Verification code sent successfully', { challengeId })
  );
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, otp } = req.body;
  if (!challengeId || !otp) {
    throw new ApiError(400, 'challengeId and otp are required');
  }

  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  if (await isOtpVerifyBlocked(clientIp)) {
    throw new ApiError(429, 'Too many failed verification attempts. Please request a new code.', 'RATE_LIMIT_EXCEEDED');
  }

  const challenge = await OtpChallenge.findOne({ challengeId });
  if (!challenge) {
    throw new ApiError(400, 'Invalid or expired verification session');
  }

  let result;
  try {
    if (challenge.purpose === 'AUTHENTICATE_EMAIL') {
      result = await OtpAuthService.verifyOTP(challengeId, otp, clientIp, userAgent);
    } else if (challenge.purpose === 'AUTHENTICATE_PHONE') {
      result = await PhoneAuthService.authenticateWithPhone(challengeId, otp, clientIp, userAgent);
    } else {
      throw new ApiError(400, 'Invalid verification purpose');
    }
    await clearOtpVerifyFailures(clientIp);
  } catch (err) {
    await recordOtpVerifyFailure(clientIp);
    throw err;
  }

  if (isAdministrativeRole(result.user.role)) {
    setAdminRefreshCookie(res, result.refreshToken);
  } else {
    setCustomerRefreshCookie(res, result.refreshToken);
  }

  // Invalidate any per-user caches after authentication
  await invalidateUserSessionCaches(result.user.id);

  res.status(200).json(
    new ApiResponse(true, 'Authentication successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  );
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) {
    throw new ApiError(400, 'Google credential token is required');
  }

  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';

  const result = await GoogleAuthService.authenticateWithGoogle(credential, clientIp, userAgent);

  if (isAdministrativeRole(result.user.role)) {
    setAdminRefreshCookie(res, result.refreshToken);
  } else {
    setCustomerRefreshCookie(res, result.refreshToken);
  }

  // Invalidate any per-user caches
  await invalidateUserSessionCaches(result.user.id);

  res.status(200).json(
    new ApiResponse(true, 'Google authentication successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  );
});

export const refreshSession = asyncHandler(async (req: Request, res: Response) => {
  const cookieToken = String(
    req.cookies?.[CUSTOMER_REFRESH_COOKIE] || req.cookies?.[ADMIN_REFRESH_COOKIE] || ''
  ).trim();
  const bodyToken = String(req.body?.refreshToken || req.headers['x-refresh-token'] || '').trim();

  const refreshToken = cookieToken || bodyToken;
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing or invalid');
  }

  const userAgent = req.headers['user-agent'] || '';
  try {
    const result = await SessionAuthService.refreshSession(refreshToken, userAgent);

    if (isAdministrativeRole(result.user.role)) {
      setAdminRefreshCookie(res, result.refreshToken);
    } else {
      setCustomerRefreshCookie(res, result.refreshToken);
    }
    // Invalidate any per‑user caches after successful refresh
    await invalidateUserSessionCaches(result.user.id);

    return res.status(200).json(
      new ApiResponse(true, 'Session refreshed successfully', {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
    );
  } catch (err: any) {
    clearCustomerRefreshCookie(res);
    clearAdminRefreshCookie(res);
    // Propagate original error (likely 401 or token invalid) to client
    throw err;
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = String(
    req.cookies?.[CUSTOMER_REFRESH_COOKIE] ||
      req.cookies?.[ADMIN_REFRESH_COOKIE] ||
      req.body?.refreshToken ||
      req.headers['x-refresh-token'] ||
      ''
  ).trim();

  if (refreshToken) {
    await SessionAuthService.revokeSession(refreshToken);
  }

  clearCustomerRefreshCookie(res);
  clearAdminRefreshCookie(res);
  // Invalidate caches on logout
  const logoutUserId = (req as any).user?.id;
  if (logoutUserId) {
    await invalidateUserSessionCaches(logoutUserId);
  }

  res.status(200).json(new ApiResponse(true, 'Logged out successfully'));
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await User.findById(userId).select('-isLocked').lean();

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  res.status(200).json(
    new ApiResponse(true, 'Profile retrieved', {
      id: String(user._id),
      _id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    })
  );
});
