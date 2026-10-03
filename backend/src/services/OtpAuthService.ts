import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User';
import AuthIdentity from '../models/AuthIdentity';
import OtpChallenge from '../models/OtpChallenge';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';
import { canonicalizeEmail } from '../utils/email/emailHelper';
import SessionAuthService from './SessionAuthService';
import { getSuperAdminEmail } from '../config/adminConfig';

let mailTransporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (mailTransporter) return mailTransporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return mailTransporter;
};

export class OtpAuthService {
  static async sendEmailOtp(email: string, otp: string) {
    const transporter = getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || 'CakePopRush <hello@cakepoprush.com>',
          to: email,
          subject: `${otp} is your CakePopRush verification code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #f3e8e2; border-radius: 16px;">
              <h2 style="color: #381e10; text-align: center; margin-bottom: 8px;">Welcome to CakePopRush!</h2>
              <p style="color: #666; text-align: center; font-size: 14px;">Use the verification code below to complete your sign in:</p>
              <div style="background-color: #fff0f5; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f21b5b;">${otp}</span>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
        logger.info(`[EMAIL] OTP sent to ${email}`);
        return;
      } catch (err: any) {
        logger.error(`[EMAIL] SMTP send error: ${err.message}`);
      }
    }

    // Dev fallback: output to logger
    logger.info(`[DEV OTP EMAIL] Dispatched OTP to ${email}: ${otp}`);
  }

  static async generateOTP(email: string, ip: string = '127.0.0.1') {
    if (!email || !email.includes('@')) {
      throw new ApiError(400, 'A valid email address is required');
    }

    const cleanEmail = canonicalizeEmail(email);
    const challengeId = crypto.randomUUID();
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate existing challenges for this email
    await OtpChallenge.deleteMany({
      identifier: cleanEmail,
      purpose: 'AUTHENTICATE_EMAIL',
    });

    await OtpChallenge.create({
      challengeId,
      purpose: 'AUTHENTICATE_EMAIL',
      identifier: cleanEmail,
      identifierType: 'email',
      otpHash,
      attempts: 0,
      maxAttempts: 5,
      exhausted: false,
      expiresAt,
    });

    await this.sendEmailOtp(cleanEmail, otp);

    return { challengeId };
  }

  static async verifyOTP(
    challengeId: string,
    otp: string,
    ip: string = '127.0.0.1',
    userAgent: string = ''
  ) {
    const cleanOtp = String(otp || '').replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      throw new ApiError(400, 'Please enter a valid 6-digit verification code');
    }

    const challenge = await OtpChallenge.findOne({ challengeId });
    if (!challenge || challenge.purpose !== 'AUTHENTICATE_EMAIL') {
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

    const cleanEmail = challenge.identifier;

    // Check identity
    let identity = await AuthIdentity.findOne({
      provider: 'email',
      providerSubjectId: cleanEmail,
    });

    let user;
    const superAdminEmail = getSuperAdminEmail();
    const isSuperAdminEnv = superAdminEmail && cleanEmail === superAdminEmail;

    if (identity) {
      user = await User.findById(identity.userId);
      if (!user || user.isLocked) {
        throw new ApiError(401, 'Account not found or locked');
      }
      user.emailVerified = true;
      user.isVerified = true;
      user.lastLogin = new Date();

      // Bootstrap super admin role if configured in env
      if (isSuperAdminEnv && user.role !== 'super_admin') {
        user.role = 'super_admin';
        logger.info(`[BOOTSTRAP] Upgraded ${cleanEmail} to super_admin via SUPER_ADMIN_EMAIL env config`);
      }

      await user.save();
    } else {
      let existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        user = existingUser;
        user.emailVerified = true;
        user.isVerified = true;
        user.lastLogin = new Date();

        if (isSuperAdminEnv && user.role !== 'super_admin') {
          user.role = 'super_admin';
          logger.info(`[BOOTSTRAP] Upgraded ${cleanEmail} to super_admin via SUPER_ADMIN_EMAIL env config`);
        }

        await user.save();

        await AuthIdentity.create({
          userId: user._id,
          provider: 'email',
          providerSubjectId: cleanEmail,
          verifiedAt: new Date(),
        });
      } else {
        const namePart = cleanEmail.split('@')[0];
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const role = isSuperAdminEnv ? 'super_admin' : 'customer';

        user = await User.create({
          name: displayName,
          email: cleanEmail,
          role,
          isVerified: true,
          emailVerified: true,
          providers: ['email'],
          lastLogin: new Date(),
        });

        await AuthIdentity.create({
          userId: user._id,
          provider: 'email',
          providerSubjectId: cleanEmail,
          verifiedAt: new Date(),
        });

        if (isSuperAdminEnv) {
          logger.info(`[BOOTSTRAP] Created initial super_admin account for ${cleanEmail}`);
        }
      }
    }

    return SessionAuthService.createSession(user, userAgent);
  }
}

export default OtpAuthService;
