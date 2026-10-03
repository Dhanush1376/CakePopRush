import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import CustomOrderConfig, { DEFAULT_CAKEPOPRUSH_CONFIG } from '../src/models/CustomOrderConfig';
import SessionAuthService from '../src/services/SessionAuthService';

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

describe('Custom Order Form Builder Configuration Matrix', () => {
  it('should return default fallback configuration on public /config endpoint when empty', async () => {
    const res = await request(app).get('/api/v1/custom-orders/config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.types).toBeDefined();
    expect(res.body.data.types.length).toBeGreaterThan(0);
    expect(res.body.data.types[0].id).toBe('general');
  });

  it('should prevent non-admin user from saving config drafts', async () => {
    const customer = await User.create({
      name: 'Customer Jane',
      email: 'customer.jane@cakepoprush.com',
      role: 'customer',
      isActive: true,
    });
    const accessToken = SessionAuthService.generateAccessToken({
      id: customer._id.toString(),
      email: customer.email,
      name: customer.name,
      role: customer.role,
    });

    const res = await request(app)
      .post('/api/v1/admin/custom-orders/config/draft')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ content: { types: [] } });

    expect(res.status).toBe(403);
  });

  it('should allow admin to save draft and then publish configuration live', async () => {
    const admin = await User.create({
      name: 'Admin Boss',
      email: 'admin.boss@cakepoprush.com',
      role: 'admin',
      isActive: true,
    });
    const accessToken = SessionAuthService.generateAccessToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // 1. Save draft
    const draftPayload = {
      types: [
        {
          id: 'general',
          name: 'Custom Party Cake Pops',
          description: 'Custom theme party cake pops',
          enabled: true,
          steps: [
            {
              id: 'step_1',
              title: 'Pick Theme',
              order: 1,
              fields: [
                {
                  id: 'f_1',
                  type: 'text',
                  label: 'Party Theme',
                  required: true,
                  order: 1,
                },
              ],
            },
          ],
        },
      ],
    };

    const draftRes = await request(app)
      .post('/api/v1/admin/custom-orders/config/draft')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ content: draftPayload });

    expect(draftRes.status).toBe(200);
    expect(draftRes.body.success).toBe(true);
    expect(draftRes.body.data.status).toBe('draft');
    expect(draftRes.body.data.types[0].name).toBe('Custom Party Cake Pops');

    // 2. Fetch admin config (should return the draft)
    const adminConfigRes = await request(app)
      .get('/api/v1/admin/custom-orders/config')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`accessToken=${accessToken}`]);

    expect(adminConfigRes.status).toBe(200);
    expect(adminConfigRes.body.data.status).toBe('draft');
    expect(adminConfigRes.body.data.types[0].name).toBe('Custom Party Cake Pops');

    // 3. Publish live
    const publishRes = await request(app)
      .post('/api/v1/admin/custom-orders/config/publish')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ content: draftPayload });

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe('published');
    expect(publishRes.body.data.version).toBe(1);

    // 4. Public endpoint should now return this published version
    const publicRes = await request(app).get('/api/v1/custom-orders/config');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.status).toBe('published');
    expect(publicRes.body.data.types[0].name).toBe('Custom Party Cake Pops');
  });
});
