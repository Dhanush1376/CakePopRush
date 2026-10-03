import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { OtpChallenge } from '../src/models/OtpChallenge';
import { User } from '../src/models/User';
import { AuthIdentity } from '../src/models/AuthIdentity';
import { RefreshToken } from '../src/models/RefreshToken';
import { UsedRefreshToken } from '../src/models/UsedRefreshToken';
import { AdminInvite } from '../src/models/AdminInvite';
import SessionAuthService from '../src/services/SessionAuthService';
import { CUSTOMER_REFRESH_COOKIE } from '../src/utils/security/authCookies';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = 'test_access_secret_12345678901234567890';
  process.env.SUPER_ADMIN_EMAIL = 'superadmin@cakepoprush.com';
  process.env.NODE_ENV = 'test';
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Authentication Matrix - CakePopRush Production Auth System', () => {
  describe('Email OTP Authentication Flow', () => {
    it('should reject invalid email formats', async () => {
      const res = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: 'invalid-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully request OTP for a valid email', async () => {
      const email = 'customer@cakepoprush.com';
      const res = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.challengeId).toBeDefined();

      // Verify challenge created in DB
      const challenge = await OtpChallenge.findOne({ challengeId: res.body.data.challengeId });
      expect(challenge).not.toBeNull();
      expect(challenge?.identifier).toBe(email);
      expect(challenge?.attempts).toBe(0);
    });

    it('should fail verification if OTP is wrong', async () => {
      const email = 'customer@cakepoprush.com';
      const reqRes = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: email });

      const challengeId = reqRes.body.data.challengeId;

      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ challengeId, otp: '000000' });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.success).toBe(false);

      const challenge = await OtpChallenge.findOne({ challengeId });
      expect(challenge?.attempts).toBe(1);
    });

    it('should successfully verify OTP, create user, and issue access + refresh tokens', async () => {
      const email = 'customer@cakepoprush.com';
      const reqRes = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: email });

      const challengeId = reqRes.body.data.challengeId;

      // Seed a known OTP hash for verification
      const knownOtp = '654321';
      const otpHash = await bcrypt.hash(knownOtp, 10);
      await OtpChallenge.updateOne({ challengeId }, { otpHash });

      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ challengeId, otp: knownOtp });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.accessToken).toBeDefined();
      expect(verifyRes.body.data.user.email).toBe(email);

      // Verify AuthIdentity record
      const identity = await AuthIdentity.findOne({ provider: 'email', providerSubjectId: email });
      expect(identity).not.toBeNull();

      // Verify User record
      const user = await User.findOne({ email });
      expect(user).not.toBeNull();
      expect(user?.role).toBe('customer');

      // Verify profile can be fetched using access token
      const profileRes = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${verifyRes.body.data.accessToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.email).toBe(email);
    });

    it('should automatically assign super_admin role when SUPER_ADMIN_EMAIL registers', async () => {
      const superEmail = 'superadmin@cakepoprush.com';
      const reqRes = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: superEmail });

      const challengeId = reqRes.body.data.challengeId;
      const knownOtp = '888888';
      const otpHash = await bcrypt.hash(knownOtp, 10);
      await OtpChallenge.updateOne({ challengeId }, { otpHash });

      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ challengeId, otp: knownOtp });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.role).toBe('super_admin');

      const user = await User.findOne({ email: superEmail });
      expect(user?.role).toBe('super_admin');
    });
  });

  describe('Mobile OTP Authentication Flow', () => {
    it('should reject invalid phone numbers', async () => {
      const res = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should accept valid normalized international phone numbers', async () => {
      const res = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: '+919876543210' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.challengeId).toBeDefined();
    });

    it('should verify mobile OTP and link phone identity', async () => {
      const phone = '+919876543210';
      const reqRes = await request(app)
        .post('/api/v1/auth/request-otp')
        .send({ identifier: phone });

      const challengeId = reqRes.body.data.challengeId;
      const knownOtp = '555555';
      const otpHash = await bcrypt.hash(knownOtp, 10);
      await OtpChallenge.updateOne({ challengeId }, { otpHash });

      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ challengeId, otp: knownOtp });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.phone).toBe(phone);

      const identity = await AuthIdentity.findOne({ provider: 'phone', providerSubjectId: phone });
      expect(identity).not.toBeNull();
    });
  });

  describe('Admin Authorization & Hierarchy', () => {
    it('should deny non-admin users from accessing admin routes', async () => {
      const user = await User.create({
        name: 'Regular Customer',
        email: 'regular@cakepoprush.com',
        role: 'customer',
      });

      const { accessToken } = await SessionAuthService.createSession(user, 'Vitest');

      const res = await request(app)
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin user to access admin routes', async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@cakepoprush.com',
        role: 'admin',
      });

      const { accessToken } = await SessionAuthService.createSession(adminUser, 'Vitest');

      const res = await request(app)
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('Administrator');
    });

    it('should allow super_admin to create admin invites for registered users', async () => {
      const superAdminUser = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });

      // Target registered user
      await User.create({
        name: 'Registered Candidate',
        email: 'candidate@cakepoprush.com',
        role: 'customer',
      });

      const { accessToken } = await SessionAuthService.createSession(superAdminUser, 'Vitest');

      const res = await request(app)
        .post('/api/v1/admin/invites')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'candidate@cakepoprush.com',
          role: 'admin',
          permissionsSummary: 'Full store management',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('candidate@cakepoprush.com');
      expect(res.body.data.roleAssigned).toBe('admin');

      // Verify invite stored in DB
      const invite = await AdminInvite.findOne({ email: 'candidate@cakepoprush.com' });
      expect(invite).not.toBeNull();
      expect(invite?.status).toBe('pending');
    });

    it('should allow invited user to accept admin invite and elevate to admin role', async () => {
      const superAdminUser = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });

      const targetUser = await User.create({
        name: 'Invitee Candidate',
        email: 'invitee@cakepoprush.com',
        role: 'customer',
      });

      const invite = await AdminInvite.create({
        email: 'invitee@cakepoprush.com',
        roleAssigned: 'admin',
        permissionsSummary: 'Admin access',
        status: 'pending',
        invitedBy: superAdminUser._id,
        invitedUser: targetUser._id,
      });

      const { accessToken } = await SessionAuthService.createSession(targetUser, 'Vitest');

      const res = await request(app)
        .post('/api/v1/admin/invites/respond')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          inviteId: String(invite._id),
          action: 'accept',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updatedUser = await User.findById(targetUser._id);
      expect(updatedUser?.role).toBe('admin');

      const updatedInvite = await AdminInvite.findById(invite._id);
      expect(updatedInvite?.status).toBe('accepted');
    });
  });

  describe('Refresh Token Lifecycle & Replay Protection', () => {
    it('should handle refresh and token rotation', async () => {
      const user = await User.create({
        name: 'Session Test User',
        email: 'session@cakepoprush.com',
        role: 'customer',
      });

      const { refreshToken } = await SessionAuthService.createSession(user, 'Vitest');

      // Refresh using cookie
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`${CUSTOMER_REFRESH_COOKIE}=${refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      // Check that a new refresh cookie is sent (token rotation)
      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
    });

    it('should invalidate sessions if revoked/expired refresh token is replayed maliciously', async () => {
      const user = await User.create({
        name: 'Replay User',
        email: 'replay@cakepoprush.com',
        role: 'customer',
      });

      const { refreshToken } = await SessionAuthService.createSession(user, 'Vitest');

      // Rotate token once
      await SessionAuthService.refreshSession(refreshToken, 'Vitest');

      // Fake that the rotation happened 5 minutes ago (outside the 60s grace period)
      const fiveMinutesAgo = new Date(Date.now() - 300000);
      await mongoose.connection.collection('usedrefreshtokens').updateMany(
        {},
        { $set: { createdAt: fiveMinutesAgo } }
      );

      // Attempt replay attack with old refreshToken
      await expect(
        SessionAuthService.refreshSession(refreshToken, 'Attacker')
      ).rejects.toThrow();

      // Verify that all refresh tokens for this user were revoked
      const remainingTokens = await RefreshToken.find({ userId: user._id });
      expect(remainingTokens.length).toBe(0);
    });
  });

  describe('Logout Endpoint', () => {
    it('should invalidate refresh tokens and clear auth cookie', async () => {
      const user = await User.create({
        name: 'Logout User',
        email: 'logout@cakepoprush.com',
        role: 'customer',
      });

      const { accessToken, refreshToken } = await SessionAuthService.createSession(user, 'Vitest');

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', [`${CUSTOMER_REFRESH_COOKIE}=${refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify cookie is cleared
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c: string) => c.includes(`${CUSTOMER_REFRESH_COOKIE}=;`))).toBe(true);

      // Verify session removed from DB
      const tokens = await RefreshToken.find({ userId: user._id });
      expect(tokens.length).toBe(0);
    });
  });
});
