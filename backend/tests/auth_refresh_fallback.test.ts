import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import { User } from '../src/models/User';
import { RefreshToken } from '../src/models/RefreshToken';
import SessionAuthService from '../src/services/SessionAuthService';
import { CUSTOMER_REFRESH_COOKIE, ADMIN_REFRESH_COOKIE } from '../src/utils/security/authCookies';

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

describe('Regression Test: Refresh Session & Identity Isolation', () => {
  it('should return 401 when refresh cookie is missing and NOT auto-login as super_admin', async () => {
    // 1. Seed a super_admin user in the database
    const superAdmin = await User.create({
      name: 'Super Admin Officer',
      email: 'superadmin@cakepoprush.com',
      role: 'super_admin',
      isVerified: true,
      emailVerified: true,
    });

    const initialTokenCount = await RefreshToken.countDocuments();
    expect(initialTokenCount).toBe(0);

    // 2. Make an unauthenticated refresh call without any cookie or body token
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({});

    // 3. Must be strictly 401 Unauthorized
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();

    // 4. Verify no session / refresh token was minted in the database
    const finalTokenCount = await RefreshToken.countDocuments();
    expect(finalTokenCount).toBe(0);

    // 5. Verify no admin cookie or credentials were set
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    if (setCookie) {
      const hasAdminCookieValue = setCookie.some(
        (c) => c.includes(ADMIN_REFRESH_COOKIE) && !c.includes(`${ADMIN_REFRESH_COOKIE}=;`)
      );
      expect(hasAdminCookieValue).toBe(false);
    }
  });

  it('should return 401 even when NODE_ENV is development (dev fallback regression prevention)', async () => {
    // Temporarily simulate development environment
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      // Seed a super admin
      await User.create({
        name: 'Dev Super Admin',
        email: 'devadmin@cakepoprush.com',
        role: 'super_admin',
        isVerified: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);

      // Verify no session was created for super admin
      const tokenCount = await RefreshToken.countDocuments();
      expect(tokenCount).toBe(0);
    } finally {
      process.env.NODE_ENV = previousEnv;
    }
  });

  it('should reject invalid/tampered refresh tokens with 401 and clear cookies', async () => {
    // Seed super admin
    await User.create({
      name: 'Admin Boss',
      email: 'boss@cakepoprush.com',
      role: 'super_admin',
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${CUSTOMER_REFRESH_COOKIE}=bogus_invalid_token_xyz_123`])
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);

    // Verify cookies are instructed to clear
    const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
    expect(setCookie).toBeDefined();
    const clearsCustomerCookie = setCookie!.some((c) => c.includes(`${CUSTOMER_REFRESH_COOKIE}=;`));
    expect(clearsCustomerCookie).toBe(true);

    // Verify no session was created
    const tokens = await RefreshToken.find();
    expect(tokens.length).toBe(0);
  });

  it('should ensure valid refresh token only refreshes the specific authenticated user', async () => {
    // Seed a customer user
    const customer = await User.create({
      name: 'Regular Customer',
      email: 'customer@cakepoprush.com',
      role: 'customer',
    });

    // Seed a super admin user
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@cakepoprush.com',
      role: 'super_admin',
    });

    // Create session for the customer
    const session = await SessionAuthService.createSession(customer, 'TestAgent');

    // Refresh customer session using customer's refresh token
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`${CUSTOMER_REFRESH_COOKIE}=${session.refreshToken}`])
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('customer@cakepoprush.com');
    expect(res.body.data.user.role).toBe('customer');

    // Super admin must NOT have been touched or assigned
    expect(res.body.data.user.role).not.toBe('super_admin');
  });

  describe('Feature-Gated OTP Rate Limiting Guards', () => {
    const originalFlag = process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT;

    afterAll(() => {
      process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT = originalFlag;
    });

    it('should block OTP send requests after window limit is exceeded when enabled', async () => {
      process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT = 'true';
      const testIp = '198.51.100.42';

      // 5 allowed requests
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/v1/auth/request-otp')
          .set('X-Forwarded-For', testIp)
          .send({ identifier: `user${i}@ratelimit-test.com` });
        expect(res.status).toBe(200);
      }

      // 6th request from same IP should be blocked with 429
      const blockedRes = await request(app)
        .post('/api/v1/auth/request-otp')
        .set('X-Forwarded-For', testIp)
        .send({ identifier: 'user6@ratelimit-test.com' });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.code).toBe('RATE_LIMIT_EXCEEDED');

      process.env.ENABLE_ADVANCED_OTP_RATE_LIMIT = 'false';
    });
  });
});

