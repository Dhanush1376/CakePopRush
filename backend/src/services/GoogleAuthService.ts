import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import AuthIdentity from '../models/AuthIdentity';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';
import { canonicalizeEmail } from '../utils/email/emailHelper';
import SessionAuthService from './SessionAuthService';
import { getSuperAdminEmail } from '../config/adminConfig';

const getGoogleClient = (() => {
  let client: OAuth2Client | null = null;
  return () => {
    if (!client) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      client = new OAuth2Client(clientId);
    }
    return client;
  };
})();

export interface GoogleProfile {
  email: string;
  name: string;
  picture: string;
  googleId: string;
  email_verified: boolean;
}

export class GoogleAuthService {
  static async verifyIdToken(credential: string): Promise<GoogleProfile> {
    const client = getGoogleClient();
    const clientId = process.env.GOOGLE_CLIENT_ID;

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId || undefined,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new ApiError(401, 'Invalid Google credential: empty payload');
      }

      if (!payload.email_verified) {
        throw new ApiError(401, 'Google account email is not verified');
      }

      if (!payload.email) {
        throw new ApiError(401, 'Google account has no email address associated');
      }

      return {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || '',
        googleId: payload.sub,
        email_verified: payload.email_verified,
      };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      logger.error(`[GOOGLE AUTH] Verification failed: ${err.message}`);
      throw new ApiError(401, 'Google authentication verification failed. Please try again.');
    }
  }

  static async authenticateWithGoogle(
    credential: string,
    ip: string = '127.0.0.1',
    userAgent: string = ''
  ) {
    const profile = await this.verifyIdToken(credential);
    const cleanEmail = canonicalizeEmail(profile.email);

    // 1. Check if google identity is already registered
    let identity = await AuthIdentity.findOne({
      provider: 'google',
      providerSubjectId: profile.googleId,
    });

    let user;
    const superAdminEmail = getSuperAdminEmail();
    const isSuperAdminEnv = superAdminEmail && cleanEmail === superAdminEmail;

    if (identity) {
      user = await User.findById(identity.userId);
      if (!user || user.isLocked) {
        throw new ApiError(401, 'Account not found or locked');
      }

      if (isSuperAdminEnv && user.role !== 'super_admin') {
        user.role = 'super_admin';
        await user.save();
      }
    } else {
      // 2. Check if an account exists with the same verified email
      let existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        user = existingUser;
        user.emailVerified = true;
        user.googleId = profile.googleId;
        if (!user.avatar && profile.picture) {
          user.avatar = profile.picture;
        }

        if (isSuperAdminEnv && user.role !== 'super_admin') {
          user.role = 'super_admin';
        }

        await user.save();

        await AuthIdentity.create({
          userId: user._id,
          provider: 'google',
          providerSubjectId: profile.googleId,
          verifiedAt: new Date(),
          metadata: {
            displayName: profile.name,
            avatar: profile.picture,
            email: cleanEmail,
          },
        });
      } else {
        // 3. Create new user account from verified Google profile
        const role = isSuperAdminEnv ? 'super_admin' : 'customer';
        user = await User.create({
          name: profile.name,
          email: cleanEmail,
          role,
          avatar: profile.picture,
          isVerified: true,
          emailVerified: true,
          googleId: profile.googleId,
          providers: ['google'],
          lastLogin: new Date(),
        });

        await AuthIdentity.create({
          userId: user._id,
          provider: 'google',
          providerSubjectId: profile.googleId,
          verifiedAt: new Date(),
          metadata: {
            displayName: profile.name,
            avatar: profile.picture,
            email: cleanEmail,
          },
        });

        logger.info(`[GOOGLE AUTH] Created new user ${user._id} for ${cleanEmail}`);
      }
    }

    return SessionAuthService.createSession(user, userAgent);
  }
}

export default GoogleAuthService;
