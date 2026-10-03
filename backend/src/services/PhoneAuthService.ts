import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import AuthIdentity from '../models/AuthIdentity';
import OtpChallenge from '../models/OtpChallenge';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';
import { getSmsProvider, normalizeIndianPhone } from './SmsProviderService';
import SessionAuthService from './SessionAuthService';
import { isAdministrativeRole } from '../config/adminConfig';

export class PhoneAuthService {
  static normalizePhone(rawPhone: string): string {
    const raw = String(rawPhone || '').trim();
    const digits = raw.replace(/\D/g, '');
    const indian10 = normalizeIndianPhone(raw);

    if (indian10.length === 10 && /^[6-9]\d{9}$/.test(indian10)) {
      return `+91${indian10}`;
    }

    if (digits.length >= 10 && digits.length <= 15) {
      return raw.startsWith('+') ? `+${digits}` : `+${digits}`;
    }

    throw new ApiError(400, 'Please enter a valid 10-digit mobile number');
  }

  static async requestOtp(phone: string, ip: string = '127.0.0.1') {
    const cleanPhone = this.normalizePhone(phone);
    const challengeId = crypto.randomUUID();
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate existing challenges for this phone
    await OtpChallenge.deleteMany({
      identifier: cleanPhone,
      purpose: 'AUTHENTICATE_PHONE',
    });

    await OtpChallenge.create({
      challengeId,
      purpose: 'AUTHENTICATE_PHONE',
      identifier: cleanPhone,
      identifierType: 'phone',
      otpHash,
      attempts: 0,
      maxAttempts: 5,
      exhausted: false,
      expiresAt,
    });

    const smsProvider = getSmsProvider();
    const dispatchResult = await smsProvider.sendOtp(cleanPhone, otp);

    if (!dispatchResult.success && process.env.NODE_ENV === 'production') {
      throw new ApiError(500, dispatchResult.error || 'Failed to send OTP via SMS gateway');
    }

    return { challengeId };
  }

  static async authenticateWithPhone(
    challengeId: string,
    otp: string,
    ip: string = '127.0.0.1',
    userAgent: string = ''
  ) {
    const cleanOtp = String(otp || '').replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      throw new ApiError(400, 'Please enter a valid 6-digit OTP');
    }

    const challenge = await OtpChallenge.findOne({ challengeId });
    if (!challenge || challenge.purpose !== 'AUTHENTICATE_PHONE') {
      throw new ApiError(400, 'Invalid or expired verification session');
    }

    if (new Date() > challenge.expiresAt) {
      throw new ApiError(400, 'Verification code has expired. Please request a new one.');
    }

    if (challenge.exhausted || challenge.attempts >= challenge.maxAttempts) {
      throw new ApiError(429, 'Maximum verification attempts exceeded. Please request a new code.');
    }

    if (challenge.consumedAt) {
      throw new ApiError(400, 'This verification code has already been used');
    }

    const isMatch = await bcrypt.compare(cleanOtp, challenge.otpHash);
    if (!isMatch) {
      challenge.attempts += 1;
      if (challenge.attempts >= challenge.maxAttempts) {
        challenge.exhausted = true;
      }
      await challenge.save();

      if (challenge.exhausted) {
        throw new ApiError(429, 'Maximum attempts exceeded. Please request a new code.');
      }
      throw new ApiError(400, 'Incorrect verification code. Please check and try again.');
    }

    challenge.consumedAt = new Date();
    await challenge.save();

    const cleanPhone = challenge.identifier;

    // Check identity
    let identity = await AuthIdentity.findOne({
      provider: 'phone',
      providerSubjectId: cleanPhone,
    });

    let user;
    if (identity) {
      user = await User.findById(identity.userId);
      if (!user || user.isLocked) {
        throw new ApiError(401, 'Account not found or locked');
      }
      user.phoneVerified = true;
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Check existing user by phone
      let existingUser = await User.findOne({ phone: cleanPhone });
      if (existingUser) {
        user = existingUser;
        user.phoneVerified = true;
        user.isVerified = true;
        user.lastLogin = new Date();
        await user.save();

        await AuthIdentity.create({
          userId: user._id,
          provider: 'phone',
          providerSubjectId: cleanPhone,
          verifiedAt: new Date(),
        });
      } else {
        // Create new customer account
        const digits = cleanPhone.replace(/\D/g, '');
        const lastDigits = digits.slice(-4);
        const displayName = `User ${lastDigits}`;

        user = await User.create({
          name: displayName,
          phone: cleanPhone,
          role: 'customer',
          isVerified: true,
          phoneVerified: true,
          providers: ['phone'],
          lastLogin: new Date(),
        });

        await AuthIdentity.create({
          userId: user._id,
          provider: 'phone',
          providerSubjectId: cleanPhone,
          verifiedAt: new Date(),
        });
      }
    }

    return SessionAuthService.createSession(user, userAgent);
  }
}

export default PhoneAuthService;
