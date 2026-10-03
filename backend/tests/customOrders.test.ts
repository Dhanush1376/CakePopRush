import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import CustomOrder from '../src/models/CustomOrder';
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

describe('Custom Orders Architecture & Security Matrix - Phase 2', () => {
  describe('General Custom Order Submission', () => {
    it('should allow an authenticated customer to submit a general custom order and securely associate userId', async () => {
      const customer = await User.create({
        name: 'Alice Baker',
        email: 'alice@cakepoprush.com',
        phone: '+1 555-0100',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Looking for 24 pastel pink and blue cake pops for a baby reveal party',
          targetDate: '2026-10-15',
          quantity: 24,
          mobileNumber: '+1 555-0100',
          occasion: 'Baby Shower',
          designImage: 'https://example.com/inspiration.jpg',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer).toBe(String(customer._id));
      expect(res.body.data.customerEmail).toBe(customer.email);
      expect(res.body.data.customerName).toBe(customer.name);
      expect(res.body.data.source).toBe('GENERAL');
      expect(res.body.data.status).toBe('Pending Quote');
      expect(res.body.data.orderId).toMatch(/^REQ-\d+/);

      // Verify in DB
      const dbOrder = await CustomOrder.findOne({ orderId: res.body.data.orderId });
      expect(dbOrder).not.toBeNull();
      expect(dbOrder?.customer?.toString()).toBe(String(customer._id));
    });

    it('should ignore spoofed customerId in request body and enforce authenticated identity', async () => {
      const legitUser = await User.create({
        name: 'Legit User',
        email: 'legit@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(legitUser._id),
        email: legitUser.email,
        name: legitUser.name,
        role: legitUser.role,
      });

      const fakeVictimId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerId: String(fakeVictimId),
          customerEmail: 'victim@cakepoprush.com',
          occasionDescription: 'Spoof attempt custom order',
          targetDate: '2026-11-01',
          quantity: 12,
          mobileNumber: '+1 555-9999',
        });

      expect(res.status).toBe(201);
      // Backend must have set customer to legitUser, NOT the spoofed victim
      expect(res.body.data.customer).toBe(String(legitUser._id));
      expect(res.body.data.customerEmail).toBe(legitUser.email);
    });

    it('should allow guest custom order submission with contact details', async () => {
      const res = await request(app)
        .post('/api/v1/custom-orders')
        .send({
          customerName: 'Guest Jane',
          customerEmail: 'guest.jane@example.com',
          mobileNumber: '+1 555-1234',
          occasionDescription: 'Unauthenticated corporate catering request',
          targetDate: '2026-12-05',
          quantity: 100,
          occasion: 'Corporate',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.customer).toBeNull();
      expect(res.body.data.customerName).toBe('Guest Jane');
      expect(res.body.data.customerEmail).toBe('guest.jane@example.com');
      expect(res.body.data.source).toBe('GENERAL');
    });

    it('should reject submission with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/custom-orders')
        .send({
          // missing occasionDescription, targetDate, etc.
          quantity: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Product-Linked Customization Flow', () => {
    it('should create a PRODUCT customization custom order with authoritative product snapshot', async () => {
      const customer = await User.create({
        name: 'Bob Treat',
        email: 'bob@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      // prod_1 exists in products.json (Chocolate Chip Cookies)
      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: 'prod_1',
          occasionDescription: 'Need custom chocolate sprinkles and gift packaging for anniversary',
          targetDate: '2026-10-20',
          quantity: 20,
          mobileNumber: '+1 555-4321',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.source).toBe('PRODUCT');
      expect(res.body.data.productId).toBe('prod_1');
      expect(res.body.data.product).not.toBeNull();
      expect(res.body.data.product.name).toBe('Chocolate Chip Cookies');
      expect(res.body.data.product.productId).toBe('prod_1');
    });

    it('should reject product customization if productId is invalid or does not exist', async () => {
      const customer = await User.create({
        name: 'Bob Treat',
        email: 'bob2@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: 'non_existent_product_xyz_123',
          occasionDescription: 'Invalid product test',
          targetDate: '2026-10-20',
          quantity: 12,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Edit Custom Order & Authorization', () => {
    it('should allow customer to edit their own custom order while in Pending Quote status', async () => {
      const customer = await User.create({
        name: 'Charlie Cake',
        email: 'charlie@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const order = await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        occasionDescription: 'Original description',
        targetDate: new Date('2026-10-01'),
        quantity: 12,
        status: 'Pending Quote',
      });

      const res = await request(app)
        .patch(`/api/v1/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Updated vision: please add gold leaf accents',
          quantity: 24,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.occasionDescription).toBe('Updated vision: please add gold leaf accents');
      expect(res.body.data.quantity).toBe(24);

      const refreshed = await CustomOrder.findById(order._id);
      expect(refreshed?.occasionDescription).toBe('Updated vision: please add gold leaf accents');
      expect(refreshed?.quantity).toBe(24);
    });

    it('should REJECT an unauthorized customer from editing another customer order (IDOR protection)', async () => {
      const victim = await User.create({
        name: 'Victim Customer',
        email: 'victim@cakepoprush.com',
        role: 'customer',
      });
      const attacker = await User.create({
        name: 'Attacker Customer',
        email: 'attacker@cakepoprush.com',
        role: 'customer',
      });
      const attackerToken = SessionAuthService.generateAccessToken({
        id: String(attacker._id),
        email: attacker.email,
        name: attacker.name,
        role: attacker.role,
      });

      const order = await CustomOrder.create({
        customer: victim._id,
        customerName: victim.name,
        customerEmail: victim.email,
        occasionDescription: 'Victim order details',
        targetDate: new Date('2026-10-01'),
        quantity: 12,
        status: 'Pending Quote',
      });

      const res = await request(app)
        .patch(`/api/v1/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${attackerToken}`)
        .send({
          occasionDescription: 'Malicious modification by attacker',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Verify uncorrupted
      const refreshed = await CustomOrder.findById(order._id);
      expect(refreshed?.occasionDescription).toBe('Victim order details');
    });

    it('should REJECT edits if custom order status has progressed beyond Pending Quote', async () => {
      const customer = await User.create({
        name: 'Daniel Berry',
        email: 'daniel@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const order = await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        occasionDescription: 'Order already quoted',
        targetDate: new Date('2026-10-01'),
        quantity: 12,
        status: 'Quoted', // Progressed past Pending Quote
      });

      const res = await request(app)
        .patch(`/api/v1/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Try to edit quoted order',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ORDER_LOCKED');
    });

    it('should update all allowed fields including occasion, date, mobile, designImage, and append to audit history', async () => {
      const customer = await User.create({
        name: 'Diana Prince',
        email: 'diana@cakepoprush.com',
        phone: '+1 555-0200',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const order = await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: '+1 555-0200',
        occasion: 'birthday',
        occasionDescription: 'Initial vision for birthday party',
        targetDate: new Date('2026-10-10'),
        quantity: 12,
        status: 'Pending Quote',
        designImage: 'https://example.com/original.jpg',
      });

      const res = await request(app)
        .patch(`/api/v1/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasion: 'wedding',
          occasionDescription: 'Updated vision for elegant wedding reception with lavender theme',
          targetDate: '2026-11-20',
          quantity: 48,
          mobileNumber: '+1 555-9876',
          designImage: 'https://example.com/wedding-lavender.jpg',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.occasion).toBe('wedding');
      expect(res.body.data.occasionDescription).toBe('Updated vision for elegant wedding reception with lavender theme');
      expect(res.body.data.quantity).toBe(48);
      expect(res.body.data.customerPhone).toBe('+1 555-9876');
      expect(res.body.data.designImage).toBe('https://example.com/wedding-lavender.jpg');

      // Verify audit history was appended
      const dbOrder = await CustomOrder.findById(order._id);
      expect(dbOrder?.statusHistory.length).toBeGreaterThanOrEqual(1);
      const lastAudit = dbOrder?.statusHistory[dbOrder.statusHistory.length - 1];
      expect(lastAudit?.note).toBe('Customer updated custom order requirements');
      expect(lastAudit?.changedBy).toBe('Diana Prince');
    });

    it('should preserve authoritative base product snapshot when editing a product-linked custom order', async () => {
      const customer = await User.create({
        name: 'Edward Nigma',
        email: 'edward@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const originalSnapshot = {
        productId: 'prod-cake-001',
        name: 'Signature Velvet Cake Pop',
        image: 'https://example.com/velvet.jpg',
        categoryName: 'Cake Pops',
        price: 24.99,
        description: 'Original artisan velvet pop',
      };

      const order = await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        source: 'PRODUCT',
        customOrderType: 'product',
        productId: 'prod-cake-001',
        productSnapshot: originalSnapshot,
        occasionDescription: 'Initial request for velvet pops',
        targetDate: new Date('2026-10-15'),
        quantity: 24,
        status: 'Pending Quote',
      });

      // Attempt to tamper with product data in the patch payload
      const res = await request(app)
        .patch(`/api/v1/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Please make frosting midnight blue',
          quantity: 36,
          // Maliciously attempt to overwrite product
          productId: 'prod-fake-999',
          productSnapshot: {
            productId: 'prod-fake-999',
            name: 'Hacked Cheap Pop',
            price: 0.01,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.occasionDescription).toBe('Please make frosting midnight blue');
      expect(res.body.data.quantity).toBe(36);

      // Verify product snapshot remained 100% authoritative and unchanged
      const dbOrder = await CustomOrder.findById(order._id);
      expect(dbOrder?.productId).toBe('prod-cake-001');
      expect(dbOrder?.productSnapshot?.name).toBe('Signature Velvet Cake Pop');
      expect(dbOrder?.productSnapshot?.price).toBe(24.99);
    });

    it('should reject unauthenticated edit requests with 401', async () => {
      const order = await CustomOrder.create({
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        occasionDescription: 'No auth order',
        targetDate: new Date('2026-10-15'),
        quantity: 12,
        status: 'Pending Quote',
      });

      const res = await request(app)
        .patch(`/api/v1/custom-orders/${order.orderId}`)
        .send({
          occasionDescription: 'Unauthorized edit without token',
        });

      expect(res.status).toBe(401);
    });

    it('should return 404 when attempting to edit a nonexistent custom order', async () => {
      const customer = await User.create({
        name: 'Frank Castle',
        email: 'frank@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const res = await request(app)
        .patch('/api/v1/custom-orders/REQ-NONEXISTENT-999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Edit ghost order',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('Customer My Orders Query', () => {
    it('should retrieve list of orders belonging to authenticated customer', async () => {
      const customer = await User.create({
        name: 'Emma Watson',
        email: 'emma@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        occasionDescription: 'Emma Order 1',
        targetDate: new Date('2026-10-01'),
        quantity: 12,
        status: 'Pending Quote',
      });

      await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        occasionDescription: 'Emma Order 2',
        targetDate: new Date('2026-10-05'),
        quantity: 24,
        status: 'Approved',
      });

      const res = await request(app)
        .get('/api/v1/custom-orders/my-orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].customerName).toBe('Emma Watson');
    });
  });

  describe('Admin Portal Custom Orders Endpoints & Security', () => {
    it('should prevent non-admin users from accessing admin custom orders', async () => {
      const customer = await User.create({
        name: 'Regular Customer',
        email: 'customer@cakepoprush.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const res = await request(app)
        .get('/api/v1/admin/custom-orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to view custom orders and aggregated stats', async () => {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@cakepoprush.com',
        role: 'admin',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      await CustomOrder.create({
        customerName: 'Customer One',
        customerEmail: 'c1@test.com',
        occasionDescription: 'Test Admin List 1',
        targetDate: new Date('2026-10-10'),
        quantity: 15,
        status: 'Pending Quote',
      });

      await CustomOrder.create({
        customerName: 'Customer Two',
        customerEmail: 'c2@test.com',
        occasionDescription: 'Test Admin List 2',
        targetDate: new Date('2026-10-12'),
        quantity: 30,
        status: 'Approved',
      });

      // Test List
      const listRes = await request(app)
        .get('/api/v1/admin/custom-orders')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(2);

      // Test Stats
      const statsRes = await request(app)
        .get('/api/v1/admin/custom-order-stats')
        .set('Authorization', `Bearer ${token}`);

      expect(statsRes.status).toBe(200);
      expect(Array.isArray(statsRes.body.data)).toBe(true);
      expect(statsRes.body.data[0].label).toBe('TOTAL REQUESTS');
      expect(statsRes.body.data[0].value).toBe('2');
    });

    it('should allow admin to update request status with audit tracking', async () => {
      const admin = await User.create({
        name: 'Admin Reviewer',
        email: 'reviewer@cakepoprush.com',
        role: 'admin',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      const order = await CustomOrder.create({
        customerName: 'Frankie',
        customerEmail: 'frankie@test.com',
        occasionDescription: 'Special cake pops',
        targetDate: new Date('2026-10-15'),
        quantity: 12,
        status: 'Pending Quote',
      });

      const res = await request(app)
        .patch(`/api/v1/admin/custom-orders/${order.orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'Quoted',
          note: 'Sent quote via email',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Quoted');
      expect(res.body.data.statusHistory.length).toBeGreaterThanOrEqual(1);

      const dbOrder = await CustomOrder.findById(order._id);
      expect(dbOrder?.status).toBe('Quoted');
    });

    it('should allow admin to delete a custom order request', async () => {
      const admin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      const order = await CustomOrder.create({
        customerName: 'To Delete',
        customerEmail: 'todelete@test.com',
        occasionDescription: 'Spam request',
        targetDate: new Date('2026-10-15'),
        quantity: 12,
      });

      const res = await request(app)
        .delete(`/api/v1/admin/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      const dbOrder = await CustomOrder.findById(order._id);
      expect(dbOrder).toBeNull();
    });
  });

  describe('Single Order Retrieval & IDOR / Data Leakage Security', () => {
    it('should reject unauthenticated access to single custom order with 401', async () => {
      const order = await CustomOrder.create({
        customerName: 'Secret Customer',
        customerEmail: 'secret@example.com',
        occasionDescription: 'Confidential request',
        targetDate: new Date('2026-10-15'),
        quantity: 12,
      });

      const res = await request(app).get(`/api/v1/custom-orders/${order.orderId}`);
      expect(res.status).toBe(401);
    });

    it('should reject User B from viewing User A custom order with 403 (IDOR Protection)', async () => {
      const userA = await User.create({
        name: 'User A',
        email: 'userA@test.com',
        role: 'customer',
      });
      const userB = await User.create({
        name: 'User B',
        email: 'userB@test.com',
        role: 'customer',
      });
      const tokenB = SessionAuthService.generateAccessToken({
        id: String(userB._id),
        email: userB.email,
        name: userB.name,
        role: userB.role,
      });

      const orderA = await CustomOrder.create({
        customer: userA._id,
        customerName: userA.name,
        customerEmail: userA.email,
        occasionDescription: 'User A private custom order',
        targetDate: new Date('2026-10-15'),
        quantity: 20,
      });

      const res = await request(app)
        .get(`/api/v1/custom-orders/${orderA.orderId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow customer to view own order, but STRIP internalNotes and adminNotes (Data Privacy)', async () => {
      const customer = await User.create({
        name: 'Owner Customer',
        email: 'owner@test.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const order = await CustomOrder.create({
        customer: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        occasionDescription: 'My own custom cake pops',
        targetDate: new Date('2026-10-15'),
        quantity: 12,
        adminNotes: 'Confidential: High value client, do not discount',
        internalNotes: [
          {
            author: 'admin_123',
            authorName: 'Senior Baker',
            text: 'Internal check: Verify allergy protocol before baking',
            createdAt: new Date(),
          },
        ],
      });

      const res = await request(app)
        .get(`/api/v1/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe(order.orderId);
      // Ensure private admin and internal notes are NEVER exposed to the customer
      expect(res.body.data.adminNotes).toBeUndefined();
      expect(res.body.data.internalNotes).toBeUndefined();
    });

    it('should allow admin to view order and access internalNotes and adminNotes', async () => {
      const admin = await User.create({
        name: 'Support Admin',
        email: 'supportadmin@test.com',
        role: 'admin',
      });
      const adminToken = SessionAuthService.generateAccessToken({
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      const order = await CustomOrder.create({
        customerName: 'Customer X',
        customerEmail: 'customerx@test.com',
        occasionDescription: 'Request with staff notes',
        targetDate: new Date('2026-10-15'),
        quantity: 12,
        adminNotes: 'VIP Customer instructions',
        internalNotes: [
          {
            author: String(admin._id),
            authorName: admin.name,
            text: 'Special color palette requested',
            createdAt: new Date(),
          },
        ],
      });

      const res = await request(app)
        .get(`/api/v1/admin/custom-orders/${order.orderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.adminNotes).toBe('VIP Customer instructions');
      expect(res.body.data.internalNotes).toBeDefined();
      expect(res.body.data.internalNotes.length).toBe(1);
      expect(res.body.data.internalNotes[0].text).toBe('Special color palette requested');
    });
  });

  describe('Form Version & Historical Data Integrity', () => {
    it('should stamp custom order with active published formVersion and preserve it across updates', async () => {
      const admin = await User.create({
        name: 'Config Admin',
        email: 'configadmin@cakepoprush.com',
        role: 'admin',
      });
      const adminToken = SessionAuthService.generateAccessToken({
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      // Publish version 1
      await request(app)
        .post('/api/v1/admin/custom-orders/config/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: {
            types: [
              {
                id: 'general',
                name: 'V1 Form',
                steps: [],
              },
            ],
          },
        });

      // Customer creates order under V1
      const customer = await User.create({
        name: 'V1 Orderer',
        email: 'v1@test.com',
        role: 'customer',
      });
      const customerToken = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const createRes = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          occasionDescription: 'Created on Form V1',
          targetDate: '2026-10-25',
          quantity: 15,
        });

      expect(createRes.status).toBe(201);
      const v1OrderId = createRes.body.data.orderId;

      // Verify V1 order has formVersion 1
      const order1 = await CustomOrder.findOne({ orderId: v1OrderId });
      expect(order1?.formVersion).toBe(1);

      // Admin publishes new form version (V2)
      await request(app)
        .post('/api/v1/admin/custom-orders/config/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: {
            types: [
              {
                id: 'general',
                name: 'V2 Form with New Fields',
                steps: [],
              },
            ],
          },
        });

      // Customer creates a new order under V2
      const createRes2 = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          occasionDescription: 'Created on Form V2',
          targetDate: '2026-10-30',
          quantity: 30,
        });

      expect(createRes2.status).toBe(201);
      const v2OrderId = createRes2.body.data.orderId;

      const order2 = await CustomOrder.findOne({ orderId: v2OrderId });
      expect(order2?.formVersion).toBe(2);

      // Verify historical order 1 retains its original formVersion 1
      const order1Refreshed = await CustomOrder.findOne({ orderId: v1OrderId });
      expect(order1Refreshed?.formVersion).toBe(1);
    });
  });

  describe('Input Sanitization & Injection Defense', () => {
    it('should reject MongoDB operator injection attempts in customizationDetails ($ operator)', async () => {
      const customer = await User.create({
        name: 'Hacker Attempt',
        email: 'hacker@test.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Injecting mongo operators',
          targetDate: '2026-10-25',
          quantity: 12,
          customizationDetails: {
            $where: 'this.password.length > 0',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid customization details');
    });

    it('should reject prototype pollution attempts in customizationDetails (__proto__)', async () => {
      const customer = await User.create({
        name: 'Polluter',
        email: 'polluter@test.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const rawPayload = JSON.stringify({
        occasionDescription: 'Prototype pollution attempt',
        targetDate: '2026-10-25',
        quantity: 12,
        customizationDetails: JSON.parse('{"constructor": {"isAdmin": true}}'),
      });

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send(rawPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid customization details');
    });

    it('should reject absurd quantities exceeding limit (>10,000 units)', async () => {
      const customer = await User.create({
        name: 'Bulk Buyer',
        email: 'bulk@test.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Ridiculous quantity request',
          targetDate: '2026-10-25',
          quantity: 500000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Quantity cannot exceed 10,000 units');
    });

    it('should reject more than 10 attachments per order', async () => {
      const customer = await User.create({
        name: 'Spammer',
        email: 'spammer@test.com',
        role: 'customer',
      });
      const token = SessionAuthService.generateAccessToken({
        id: String(customer._id),
        email: customer.email,
        name: customer.name,
        role: customer.role,
      });

      const attachments = Array.from({ length: 15 }, (_, i) => ({
        url: `https://example.com/image${i}.jpg`,
        mimeType: 'image/jpeg',
      }));

      const res = await request(app)
        .post('/api/v1/custom-orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          occasionDescription: 'Flooding attachments',
          targetDate: '2026-10-25',
          quantity: 10,
          attachments,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot exceed 10 attachments');
    });
  });
});

