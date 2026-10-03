import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import Order from '../src/models/Order';
import PaymentAttempt from '../src/models/PaymentAttempt';
import productsData from '../src/data/seed/products.json';

let mongoServer: MongoMemoryServer;
const JWT_SECRET = 'test_access_secret_12345678901234567890';
const RAZORPAY_SECRET = 'test_razorpay_secret_key_12345';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.OTP_SECRET = 'cpr_test_dedicated_otp_secret_key_8849302187654321';
  process.env.RAZORPAY_KEY_SECRET = RAZORPAY_SECRET;
  process.env.NODE_ENV = 'test';
  process.env.VITEST = 'true';
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

const generateToken = (userId: string, role = 'customer') => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' });
};

describe('CakePopRush Order, Payment & Delivery System Test Matrix', () => {
  const sampleProduct = (productsData as any[])[0]; // prod_1

  const mockAddress = {
    recipientName: 'Dhanush Tester',
    phone: '9876543210',
    line1: '42 Baker Street',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    type: 'home',
  };

  describe('1. Order Creation & Idempotency', () => {
    it('should reject unauthenticated order creation with 401', async () => {
      const res = await request(app).post('/api/v1/orders').send({
        items: [{ productId: sampleProduct.id, quantity: 1 }],
        shippingAddress: mockAddress,
        paymentMethod: 'cod',
      });
      expect(res.status).toBe(401);
    });

    it('should successfully place a COD order and clear customer cart', async () => {
      const user = await User.create({
        name: 'Dhanush',
        email: 'dhanush@test.com',
        role: 'customer',
        cart: [{ productId: sampleProduct.id, quantity: 2, title: sampleProduct.name, price: sampleProduct.price }],
      });
      const token = generateToken(String(user._id));

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: sampleProduct.id, quantity: 2 }],
          shippingAddress: mockAddress,
          paymentMethod: 'cod',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isInstantCheckout).toBe(true);
      expect(res.body.data.order.status).toBe('CONFIRMED');
      expect(res.body.data.order.payment.method).toBe('cod');
      expect(res.body.data.order.isNonReturnable).toBe(true);

      // Verify cart was cleared
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.cart?.length).toBe(0);

      // Verify DB persistence
      const savedOrder = await Order.findById(res.body.data.order._id);
      expect(savedOrder).toBeTruthy();
      const expectedSubtotal = Math.round((sampleProduct.basePrice || sampleProduct.price) / (sampleProduct.basePrice ? 100 : 1)) * 2;
      expect(savedOrder?.subtotal).toBe(expectedSubtotal);
    });

    it('should be idempotent and return identical order on duplicate request with same idempotencyKey', async () => {
      const user = await User.create({
        name: 'Duplicate Buyer',
        email: 'dup@test.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));
      const idempotencyKey = 'unique-key-12345';

      const res1 = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          items: [{ productId: sampleProduct.id, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'cod',
        });

      expect(res1.status).toBe(201);
      const orderId1 = res1.body.data.order._id;

      const res2 = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          items: [{ productId: sampleProduct.id, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'cod',
        });

      expect(res2.status).toBe(201);
      expect(res2.body.data.order._id).toBe(orderId1);

      // Verify only 1 order exists in database
      const orderCount = await Order.countDocuments({ user: user._id });
      expect(orderCount).toBe(1);
    });
  });

  describe('2. Razorpay Online Flow & Signature Verification', () => {
    it('should initiate Razorpay order and create PaymentAttempt without clearing cart immediately', async () => {
      const user = await User.create({
        name: 'Online Shopper',
        email: 'online@test.com',
        role: 'customer',
        cart: [{ productId: sampleProduct.id, quantity: 1, title: sampleProduct.name, price: sampleProduct.price }],
      });
      const token = generateToken(String(user._id));

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: sampleProduct.id, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'razorpay',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('online');
      expect(res.body.data.razorpayOrder.id).toBeTruthy();

      // Cart should NOT be cleared yet
      const refreshedUser = await User.findById(user._id);
      expect(refreshedUser?.cart?.length).toBe(1);

      // PaymentAttempt should exist
      const attempt = await PaymentAttempt.findOne({ razorpayOrderId: res.body.data.razorpayOrder.id });
      expect(attempt).toBeTruthy();
      expect(attempt?.status).toBe('initiated');
    });

    it('should verify valid Razorpay signature, create confirmed Order, and clear cart', async () => {
      const user = await User.create({
        name: 'Verified Shopper',
        email: 'verified@test.com',
        role: 'customer',
        cart: [{ productId: sampleProduct.id, quantity: 1, title: sampleProduct.name, price: sampleProduct.price }],
      });
      const token = generateToken(String(user._id));

      const initRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: sampleProduct.id, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'razorpay',
        });

      const razorpayOrderId = initRes.body.data.razorpayOrder.id;
      const razorpayPaymentId = `pay_${Date.now()}`;

      // Generate valid HMAC signature
      const hmac = crypto.createHmac('sha256', RAZORPAY_SECRET);
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const validSignature = hmac.digest('hex');

      const verifyRes = await request(app)
        .post('/api/v1/orders/verify-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.status).toBe('CONFIRMED');
      expect(verifyRes.body.data.payment.status).toBe('paid');

      // Cart should now be cleared
      const userAfter = await User.findById(user._id);
      expect(userAfter?.cart?.length).toBe(0);

      // PaymentAttempt should now be success
      const attempt = await PaymentAttempt.findOne({ razorpayOrderId });
      expect(attempt?.status).toBe('success');
    });

    it('should reject tampered or invalid Razorpay signature with 400', async () => {
      const user = await User.create({
        name: 'Hacker Attempt',
        email: 'hacker@test.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      const initRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ productId: sampleProduct.id, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'razorpay',
        });

      const razorpayOrderId = initRes.body.data.razorpayOrder.id;
      const razorpayPaymentId = `pay_fake_123`;

      const verifyRes = await request(app)
        .post('/api/v1/orders/verify-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: 'tampered_fake_signature_hash_hex_length_64_characters_here_1234567890',
        });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.message).toContain('Invalid payment signature');
    });
  });

  describe('3. Admin Order Management & Delivery Agent Assignment', () => {
    it('should list orders in admin and calculate order statistics', async () => {
      const admin = await User.create({ name: 'Admin', email: 'admin@cakepoprush.com', role: 'admin' });
      const adminToken = generateToken(String(admin._id), 'admin');

      // Create a test order
      await Order.create({
        orderNumber: 'CPR-TEST-100',
        customerName: 'Test Customer',
        customerEmail: 'cust@test.com',
        subtotal: 500,
        total: 500,
        status: 'CONFIRMED',
        payment: { method: 'cod', status: 'Pending COD' },
        delivery: { addressSnapshot: mockAddress, otpAttempts: 0, otpMaxAttempts: 5, isCodCollected: false },
      });

      const listRes = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.orders.length).toBeGreaterThanOrEqual(1);

      const statsRes = await request(app)
        .get('/api/v1/admin/order-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.confirmed).toBeGreaterThanOrEqual(1);
    });

    it('should allow admin to assign a delivery agent and transition order to PROCESSING', async () => {
      const admin = await User.create({ name: 'Admin', email: 'superadmin@cakepoprush.com', role: 'super_admin' });
      const adminToken = generateToken(String(admin._id), 'super_admin');

      const agent = await User.create({
        name: 'Ravi Delivery',
        email: 'ravi@cakepoprush.com',
        phone: '9876500000',
        role: 'delivery_agent',
        isActive: true,
      });

      const order = await Order.create({
        orderNumber: 'CPR-ASSIGN-101',
        customerName: 'Test Customer',
        customerEmail: 'cust@test.com',
        subtotal: 500,
        total: 500,
        status: 'CONFIRMED',
        payment: { method: 'cod', status: 'Pending COD' },
        delivery: { addressSnapshot: mockAddress, otpAttempts: 0, otpMaxAttempts: 5, isCodCollected: false },
      });

      const assignRes = await request(app)
        .post(`/api/v1/admin/orders/${order._id}/assign-agent`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ agentId: String(agent._id) });

      expect(assignRes.status).toBe(200);
      expect(['PROCESSING', 'BEING BAKED']).toContain(assignRes.body.data.status);
      expect(String(assignRes.body.data.delivery.agentId)).toBe(String(agent._id));

    });
  });

  describe('4. Delivery Agent Portal, IDOR Protection & OTP Flow', () => {
    it('should enforce IDOR security: Agent A cannot access Agent B assigned orders', async () => {
      const agentA = await User.create({ name: 'Agent A', email: 'a@cpr.com', role: 'delivery_agent', isActive: true });
      const agentB = await User.create({ name: 'Agent B', email: 'b@cpr.com', role: 'delivery_agent', isActive: true });

      const tokenA = generateToken(String(agentA._id), 'delivery_agent');
      const tokenB = generateToken(String(agentB._id), 'delivery_agent');

      const orderA = await Order.create({
        orderNumber: 'CPR-AGENT-A',
        customerName: 'Customer A',
        customerEmail: 'a@test.com',
        subtotal: 300,
        total: 300,
        status: 'PROCESSING',
        delivery: { agentId: agentA._id, addressSnapshot: mockAddress, otpAttempts: 0, otpMaxAttempts: 5, isCodCollected: false },
      });

      // Agent A can view their assigned order by _id
      const resA = await request(app)
        .get(`/api/v1/delivery/orders/${orderA._id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(resA.status).toBe(200);

      // Agent A can ALSO view their assigned order by orderNumber (e.g. CPR-AGENT-A)
      const resAByNum = await request(app)
        .get(`/api/v1/delivery/orders/${orderA.orderNumber}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(resAByNum.status).toBe(200);
      expect(resAByNum.body.data.orderNumber).toBe('CPR-AGENT-A');

      // Admin / Staff supervisor can view the assigned order by orderNumber
      const adminUser = await User.create({ name: 'Admin Supervisor', email: 'admin@cpr.com', role: 'admin' });
      const adminToken = generateToken(String(adminUser._id), 'admin');
      const resAdmin = await request(app)
        .get(`/api/v1/delivery/orders/${orderA.orderNumber}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resAdmin.status).toBe(200);

      // Agent B MUST be rejected with 403 Forbidden by _id
      const resB = await request(app)
        .get(`/api/v1/delivery/orders/${orderA._id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(resB.status).toBe(403);

      // Agent B MUST ALSO be rejected with 403 Forbidden by orderNumber
      const resBByNum = await request(app)
        .get(`/api/v1/delivery/orders/${orderA.orderNumber}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(resBByNum.status).toBe(403);
    });

    it('should generate secure Delivery OTP, verify OTP, confirm COD and atomically mark DELIVERED', async () => {
      const agent = await User.create({ name: 'Delivery Agent Fast', email: 'fast@cpr.com', role: 'delivery_agent', isActive: true });
      const agentToken = generateToken(String(agent._id), 'delivery_agent');

      const order = await Order.create({
        orderNumber: 'CPR-DELIVERY-TEST',
        customerName: 'Customer Happy',
        customerEmail: 'happy@test.com',
        customerPhone: '9876543210',
        subtotal: 450,
        deliveryFee: 49,
        codFee: 30,
        total: 529,
        status: 'PROCESSING',
        payment: { method: 'cod', status: 'Pending COD' },
        paymentMethod: 'cod',
        delivery: {
          agentId: agent._id,
          addressSnapshot: mockAddress,
          otpAttempts: 0,
          otpMaxAttempts: 5,
          isCodCollected: false,
        },
      });

      // 1. Dispatch Delivery OTP
      const otpSendRes = await request(app)
        .post(`/api/v1/delivery/orders/${order._id}/send-otp`)
        .set('Authorization', `Bearer ${agentToken}`);

      expect(otpSendRes.status).toBe(200);
      expect(otpSendRes.body.success).toBe(true);

      // Plaintext OTP is NOT returned in response
      expect(otpSendRes.body.data.otp).toBeUndefined();

      // Retrieve hashed OTP from DB for testing
      const orderWithSecret = await Order.findById(order._id).select('+delivery.otpHash');
      expect(orderWithSecret?.delivery.otpHash).toBeTruthy();

      // 2. Test wrong OTP rejection (should remain in active state and increment attempt counter)
      const wrongRes = await request(app)
        .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          otp: '000000',
          codConfirmed: true,
          codAmountCollected: 529,
        });

      expect(wrongRes.status).toBe(400);
      expect(wrongRes.body.message).toContain('Incorrect delivery OTP');

      const orderAfterWrong = await Order.findById(order._id);
      expect(['PROCESSING', 'BEING BAKED']).toContain(orderAfterWrong?.status); // Status unchanged!
      expect(orderAfterWrong?.delivery.otpAttempts).toBe(1);

      // 3. For test verification, set a known OTP hash
      const knownOtp = '742918';
      const knownHash = crypto.createHash('sha256').update(knownOtp).digest('hex');
      await Order.findByIdAndUpdate(order._id, {
        $set: {
          'delivery.otpHash': knownHash,
          'delivery.otpExpiresAt': new Date(Date.now() + 15 * 60 * 1000),
          'delivery.otpAttempts': 0,
        },
      });

      // 4. Test missing COD confirmation (must be rejected)
      const missingCodRes = await request(app)
        .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          otp: knownOtp,
          codConfirmed: false,
        });

      expect(missingCodRes.status).toBe(400);
      expect(missingCodRes.body.message).toContain('Cash collection confirmation is required');

      // 5. Successful delivery verification
      const successRes = await request(app)
        .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          otp: knownOtp,
          codConfirmed: true,
          codAmountCollected: 529,
        });

      expect(successRes.status).toBe(200);
      expect(successRes.body.data.status).toBe('DELIVERED');
      expect(successRes.body.data.payment.status).toBe('paid');
      expect(successRes.body.data.delivery.isCodCollected).toBe(true);

      // Verify in DB
      const deliveredOrder = await Order.findById(order._id);
      expect(deliveredOrder?.status).toBe('DELIVERED');
      expect(deliveredOrder?.delivery.deliveredAt).toBeTruthy();
    });
  });
});
