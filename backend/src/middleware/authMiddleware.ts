import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';
import User from '../models/User';
import logger from '../config/logger';
import { STAFF_ROLES, isDeliveryAgentRole } from '../config/adminConfig';

export interface JwtPayload {
  id: string;
  role: string;
  email?: string;
  name?: string;
  phone?: string;
  iat?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    // Strict dev bypass: ONLY active when explicitly configured via ALLOW_DEV_AUTH_BYPASS in development
    if (
      process.env.ALLOW_DEV_AUTH_BYPASS === 'true' &&
      process.env.NODE_ENV === 'development' &&
      process.env.VITEST !== 'true'
    ) {
      const devAdmin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } })
        .select('role email name')
        .lean();
      if (devAdmin) {
        req.user = {
          id: String(devAdmin._id),
          role: devAdmin.role,
          email: devAdmin.email,
          name: devAdmin.name,
        };
        return next();
      }
    }
    throw new ApiError(401, 'Authentication required');
  }

  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'cakepoprush_dev_jwt_secret_min_32_chars' : '');
  if (!secret) {
    throw new ApiError(500, 'Security configuration error: JWT_SECRET missing in production');
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('role email name isVerified isLocked passwordChangedAt').lean();
    if (!user || user.isLocked) {
      throw new ApiError(401, 'User session invalid or account locked');
    }

    if (
      user.passwordChangedAt &&
      decoded.iat != null &&
      decoded.iat < Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)
    ) {
      throw new ApiError(401, 'Session revoked. Please log in again.');
    }

    decoded.role = user.role;
    decoded.email = user.email;
    decoded.name = user.name;
    req.user = decoded;

    next();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;

    // Strict dev bypass: ONLY active when explicitly configured via ALLOW_DEV_AUTH_BYPASS in development
    if (
      process.env.ALLOW_DEV_AUTH_BYPASS === 'true' &&
      process.env.NODE_ENV === 'development' &&
      process.env.VITEST !== 'true'
    ) {
      try {
        const unverified = jwt.decode(token) as JwtPayload | null;
        if (unverified && unverified.id) {
          const user = await User.findById(unverified.id)
            .select('role email name isVerified isLocked')
            .lean();
          if (user && !user.isLocked) {
            req.user = {
              id: String(user._id),
              role: user.role,
              email: user.email,
              name: user.name,
            };
            return next();
          }
        }
      } catch (_) {}
    }

    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired. Please refresh session.');
    }
    throw new ApiError(401, 'Invalid authentication token');
  }
});

export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'cakepoprush_dev_jwt_secret_min_32_chars' : '');
  if (!secret) return next();
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.id).select('role email name isVerified isLocked').lean();
    if (user && !user.isLocked) {
      decoded.role = user.role;
      decoded.email = user.email;
      decoded.name = user.name;
      req.user = decoded;
    }
  } catch {
    // Ignored in optional auth
  }
  next();
});

export const requireAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if ((STAFF_ROLES as readonly string[]).includes(req.user.role)) {
    return next();
  }

  logger.warn(`[FORBIDDEN] Non-admin user ${req.user.id} (role: ${req.user.role}) attempted to access admin route ${req.originalUrl}`);
  throw new ApiError(403, 'Administrative access required. Access denied.');
});

export const requireSuperAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (req.user.role === 'super_admin' || req.user.role === 'owner') {
    return next();
  }

  throw new ApiError(403, 'Super Administrator access required. Access denied.');
});

export const requireDeliveryAgent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (isDeliveryAgentRole(req.user.role)) {
    return next();
  }

  // Administrative staff can only access delivery routes when explicitly inspecting a specific order or task
  if (
    (STAFF_ROLES as readonly string[]).includes(req.user.role) &&
    (req.path.startsWith('/orders/') || req.path.startsWith('/tasks/'))
  ) {
    return next();
  }

  logger.warn(`[FORBIDDEN] Non-delivery user ${req.user.id} (role: ${req.user.role}) attempted to access delivery route ${req.originalUrl}`);
  throw new ApiError(403, 'Delivery Agent portal access required. Access denied.');
});
