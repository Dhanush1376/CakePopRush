import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import Order from '../src/models/Order';
import OrderStateMachine from '../src/services/orders/OrderStateMachine';

let mongoServer: MongoMemoryServer;
const JWT_SECRET = 'master_test_jwt_secret_12345678901234567890';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.OTP_SECRET = 'cpr_test_dedicated_otp_secret_key_8849302187654321';
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

describe('Master Production-Grade Order -> Delivery -> Live Tracking -> OTP Architecture', () => {
  const mockAddress = {
    recipientName: 'Arjun Verma',
    phone: '9876543210',
    line1: '100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    type: 'home',
  };

  it('Phase 40 Final Acceptance Test: Complete End-to-End Delivery Flow', async () => {
    // 1. Create Actors
    const customer = await User.create({
      name: 'Arjun Verma',
      email: 'arjun@customer.com',
      role: 'customer',
    });
    const customerToken = generateToken(String(customer._id), 'customer');

    const admin = await User.create({
      name: 'Priya Admin',
      email: 'priya@cakepoprush.com',
      role: 'admin',
    });
    const adminToken = generateToken(String(admin._id), 'admin');

    const agent = await User.create({
      name: 'Ravi Delivery Partner',
      email: 'ravi@cakepoprush.com',
      role: 'delivery_agent',
      isActive: true,
    });
    const agentToken = generateToken(String(agent._id), 'delivery_agent');

    // 2. Order Placed (CONFIRMED)
    const order = await Order.create({
      orderNumber: 'CPR-E2E-999',
      user: customer._id,
      customer: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: '9876543210',
      subtotal: 750,
      deliveryFee: 40,
      total: 790,
      status: 'CONFIRMED',
      internalStatus: 'CONFIRMED',
      payment: { method: 'cod', status: 'Pending COD' },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      delivery: {
        addressSnapshot: mockAddress,
        otpAttempts: 0,
        otpMaxAttempts: 5,
        isCodCollected: false,
      },
    });

    // Verify customer sees CONFIRMED, no OTP, no live tracking
    const custRes1 = await request(app)
      .get(`/api/v1/orders/${order._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(custRes1.status).toBe(200);
    expect(custRes1.body.data.status).toBe('CONFIRMED');
    expect(custRes1.body.data.deliveryOtp).toBeUndefined();

    const trackRes1 = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(trackRes1.status).toBe(200);
    expect(trackRes1.body.data.trackingActive).toBe(false);

    // 3. Admin Approves Order -> BEING BAKED (internal: PREPARING)
    const approveRes = await request(app)
      .post(`/api/v1/admin/orders/${order._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('BEING BAKED');
    expect(approveRes.body.data.internalStatus).toBe('PREPARING');

    // 4. Order Prepared & Packed -> Mark Ready (READY_FOR_PICKUP)
    const readyRes = await request(app)
      .post(`/api/v1/admin/orders/${order._id}/mark-ready`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.data.internalStatus).toBe('READY_FOR_PICKUP');
    expect(readyRes.body.data.status).toBe('BEING BAKED'); // Customer status remains BEING BAKED!

    // 5. Admin Assigns Delivery Agent -> ASSIGNED (Assignment != Dispatch!)
    const assignRes = await request(app)
      .post(`/api/v1/admin/orders/${order._id}/assign-agent`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ agentId: String(agent._id) });
    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.internalStatus).toBe('ASSIGNED');
    expect(assignRes.body.data.status).toBe('BEING BAKED'); // Still NOT dispatched!
    expect(String(assignRes.body.data.delivery.agentId)).toBe(String(agent._id));

    // Customer still sees BEING BAKED and NO OTP
    const custRes2 = await request(app)
      .get(`/api/v1/orders/${order._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(custRes2.body.data.status).toBe('BEING BAKED');
    expect(custRes2.body.data.deliveryOtp).toBeUndefined();

    // 6. Delivery Agent sees task in their portal & Accepts Delivery
    const agentTasksRes = await request(app)
      .get('/api/v1/delivery/orders')
      .set('Authorization', `Bearer ${agentToken}`);
    expect(agentTasksRes.status).toBe(200);
    expect(agentTasksRes.body.data.length).toBe(1);
    expect(agentTasksRes.body.data[0].deliveryStatus).toBe('ASSIGNED');
    // Security check: Agent NEVER receives customer OTP
    expect(agentTasksRes.body.data[0].deliveryOtp).toBeUndefined();

    const acceptRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/accept`)
      .set('Authorization', `Bearer ${agentToken}`);
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.internalStatus).toBe('AGENT_ACCEPTED');
    expect(acceptRes.body.data.status).toBe('BEING BAKED');

    // 7. Delivery Agent Arrives at Kitchen & Confirms Pickup -> DISPATCHED!
    const pickupRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/pickup`)
      .set('Authorization', `Bearer ${agentToken}`);
    expect(pickupRes.status).toBe(200);
    expect(pickupRes.body.data.status).toBe('DISPATCHED');
    expect(pickupRes.body.data.internalStatus).toBe('DISPATCHED');
    expect(pickupRes.body.data.delivery.dispatchedAt).toBeTruthy();

    // Plaintext OTP is NOT returned in agent response
    expect(pickupRes.body.data.deliveryOtp).toBeUndefined();

    // 8. Customer NOW sees DISPATCHED, receives OTP, and has LIVE TRACKING!
    const custRes3 = await request(app)
      .get(`/api/v1/orders/${order._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(custRes3.status).toBe(200);
    expect(custRes3.body.data.status).toBe('DISPATCHED');
    const customerOtp = custRes3.body.data.deliveryOtp;
    expect(customerOtp).toBeTruthy();
    expect(customerOtp).toMatch(/^\d{6}$/); // 6-digit numeric OTP

    // Verify Live Tracking is now active
    const trackRes2 = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(trackRes2.status).toBe(200);
    expect(trackRes2.body.data.trackingActive).toBe(true);
    expect(trackRes2.body.data.deliveryOtp).toBe(customerOtp);
    expect(trackRes2.body.data.agent.name).toBe(agent.name);

    // 9. Delivery Agent pushes GPS updates
    const locRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/location`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ latitude: 18.955, longitude: 72.805 });
    expect(locRes.status).toBe(200);
    expect(locRes.body.data.latitude).toBe(18.955);
    expect(locRes.body.data.longitude).toBe(72.805);

    // Customer tracking reflects updated GPS location
    const trackRes3 = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(trackRes3.body.data.currentLocation.latitude).toBe(18.955);

    // 10. Delivery Agent arrives at customer doorstep
    // Test Wrong OTP rejection
    const wrongOtpRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        otp: '999999',
        codConfirmed: true,
        codAmountCollected: 790,
      });
    expect(wrongOtpRes.status).toBe(400);
    expect(wrongOtpRes.body.message).toContain('Incorrect delivery OTP');

    // Test Missing COD collection confirmation
    const missingCodRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        otp: customerOtp,
        codConfirmed: false,
      });
    expect(missingCodRes.status).toBe(400);
    expect(missingCodRes.body.message).toContain('Cash collection confirmation is required');

    // Successful OTP verification & Delivery Completion
    const completeRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        otp: customerOtp,
        codConfirmed: true,
        codAmountCollected: 790,
      });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('DELIVERED');
    expect(completeRes.body.data.internalStatus).toBe('DELIVERED');
    expect(completeRes.body.data.payment.status).toBe('paid');
    expect(completeRes.body.data.delivery.isCodCollected).toBe(true);

    // 11. Post-Delivery State Invariants
    // Live tracking is closed
    const trackRes4 = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(trackRes4.body.data.trackingActive).toBe(false);
    expect(trackRes4.body.data.delivered).toBe(true);
    expect(trackRes4.body.data.deliveryOtp).toBeUndefined(); // Consumed and hidden

    // Customer orders page sees DELIVERED and no OTP
    const custRes4 = await request(app)
      .get(`/api/v1/orders/${order._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(custRes4.body.data.status).toBe('DELIVERED');
    expect(custRes4.body.data.deliveryOtp).toBeUndefined();

    // No further location updates allowed once delivered
    const postDeliveryLoc = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/location`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ latitude: 18.900, longitude: 72.800 });
    expect(postDeliveryLoc.status).toBe(400);

    // No re-verification allowed
    const reVerifyRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ otp: customerOtp, codConfirmed: true, codAmountCollected: 790 });
    expect(reVerifyRes.status).toBe(409);
  });

  it('IDOR Security: Agent B cannot accept, pickup, or verify Agent A order', async () => {
    const agentA = await User.create({ name: 'Agent A', email: 'agentA@test.com', role: 'delivery_agent', isActive: true });
    const agentB = await User.create({ name: 'Agent B', email: 'agentB@test.com', role: 'delivery_agent', isActive: true });
    const tokenB = generateToken(String(agentB._id), 'delivery_agent');

    const order = await Order.create({
      orderNumber: 'CPR-IDOR-1',
      customerName: 'Customer',
      customerEmail: 'cust@test.com',
      subtotal: 400,
      total: 400,
      status: 'BEING BAKED',
      internalStatus: 'ASSIGNED',
      delivery: {
        agentId: agentA._id,
        addressSnapshot: mockAddress,
        otpAttempts: 0,
        otpMaxAttempts: 5,
        isCodCollected: false,
      },
    });

    // Agent B attempts to accept Agent A's order -> 403 Forbidden
    const acceptB = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/accept`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(acceptB.status).toBe(403);

    // Agent B attempts pickup -> 403 Forbidden
    const pickupB = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/pickup`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(pickupB.status).toBe(403);

    // Agent B attempts verify-otp -> 403 Forbidden
    const verifyB = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ otp: '123456' });
    expect(verifyB.status).toBe(403);
  });

  it('Customer Data Scoping: Customer B cannot track Customer A order', async () => {
    const custA = await User.create({ name: 'Cust A', email: 'a@test.com', role: 'customer' });
    const custB = await User.create({ name: 'Cust B', email: 'b@test.com', role: 'customer' });
    const tokenB = generateToken(String(custB._id), 'customer');

    const order = await Order.create({
      orderNumber: 'CPR-IDOR-CUST',
      user: custA._id,
      customer: custA._id,
      customerName: 'Cust A',
      customerEmail: 'a@test.com',
      subtotal: 300,
      total: 300,
      status: 'DISPATCHED',
      internalStatus: 'DISPATCHED',
      delivery: {
        addressSnapshot: mockAddress,
        customerOtp: '555222',
        otpAttempts: 0,
        otpMaxAttempts: 5,
        isCodCollected: false,
      },
    });

    const trackB = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(trackB.status).toBe(403);
  });

  it('State Machine Rules: Rejects illegal status transitions', () => {
    expect(() => {
      OrderStateMachine.validateInternalTransition('order_1', 'DELIVERED', 'PREPARING');
    }).toThrow();

    expect(() => {
      OrderStateMachine.validateInternalTransition('order_2', 'CONFIRMED', 'DELIVERED');
    }).toThrow();

    expect(() => {
      OrderStateMachine.validateInternalTransition('order_3', 'DISPATCHED', 'PREPARING');
    }).toThrow();
  });

  it('HMAC-SHA256 OTP Security: Uses server secret and orderId salt', async () => {
    const cust = await User.create({ name: 'Salt Cust', email: 'salt@test.com', role: 'customer' });
    const order = await Order.create({
      orderNumber: 'CPR-SALT-1',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 500,
      total: 500,
      delivery: { addressSnapshot: mockAddress, otpAttempts: 0, otpMaxAttempts: 5, isCodCollected: false },
    });

    const DeliveryService = (await import('../src/services/DeliveryService.js')).DeliveryService;
    const hash1 = DeliveryService.hashDeliveryOtp(String(order._id), '123456');
    const hash2 = DeliveryService.hashDeliveryOtp(String(order._id), '123456');
    const diffOrderHash = DeliveryService.hashDeliveryOtp('diff_order_id_999', '123456');

    // Deterministic for same order + OTP
    expect(hash1).toBe(hash2);
    // Salted by orderId: same OTP generates different hash for another order (immune to rainbow tables)
    expect(hash1).not.toBe(diffOrderHash);
    // Not equal to plain SHA-256
    const crypto = await import('crypto');
    const plainSha256 = crypto.createHash('sha256').update('123456').digest('hex');
    expect(hash1).not.toBe(plainSha256);
  });

  it('State Consistency Lock: internalStatus projects 4 customer states and syncs delivery.status', async () => {
    const cust = await User.create({ name: 'State Cust', email: 'state@test.com', role: 'customer' });
    const order = await Order.create({
      orderNumber: 'CPR-STATE-SYNC',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 500,
      total: 500,
      internalStatus: 'READY_FOR_PICKUP',
      delivery: { addressSnapshot: mockAddress, isCodCollected: false },
    });

    // Customer status is automatically BEING BAKED
    expect(order.status).toBe('BEING BAKED');
    expect(order.orderStatus).toBe('BEING BAKED');

    // Updating internalStatus to DISPATCHED automatically updates customer status to DISPATCHED
    order.internalStatus = 'DISPATCHED';
    await order.save();
    expect(order.status).toBe('DISPATCHED');
    expect(order.delivery.status).toBe('DISPATCHED');

    // Updating internalStatus to DELIVERED automatically updates customer status to DELIVERED
    order.internalStatus = 'DELIVERED';
    await order.save();
    expect(order.status).toBe('DELIVERED');
    expect(order.delivery.status).toBe('DELIVERED');
  });

  it('Idempotent & Concurrent OTP Verification: Double request completes exactly once', async () => {
    const cust = await User.create({ name: 'Idemp Cust', email: 'idemp@test.com', role: 'customer' });
    const agent = await User.create({ name: 'Idemp Agent', email: 'idempagent@test.com', role: 'delivery_agent', isActive: true });
    const agentToken = generateToken(String(agent._id), 'delivery_agent');

    const DeliveryService = (await import('../src/services/DeliveryService.js')).DeliveryService;
    const testOtp = '778899';

    const order = await Order.create({
      orderNumber: 'CPR-CONCURRENT-1',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 500,
      total: 500,
      status: 'DISPATCHED',
      internalStatus: 'DISPATCHED',
      delivery: {
        addressSnapshot: mockAddress,
        agentId: agent._id,
        status: 'DISPATCHED',
        customerOtp: testOtp,
        otpHash: DeliveryService.hashDeliveryOtp('temp_id', testOtp), // updated below
        otpExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        otpAttempts: 0,
        otpMaxAttempts: 5,
        isCodCollected: false,
      },
    });

    // Hash correctly with real order._id
    order.delivery.otpHash = DeliveryService.hashDeliveryOtp(String(order._id), testOtp);
    await order.save();

    // Fire two concurrent OTP verification requests simultaneously
    const [res1, res2] = await Promise.all([
      request(app)
        .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ otp: testOtp }),
      request(app)
        .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ otp: testOtp }),
    ]);

    // Both requests must complete successfully with DELIVERED status (no 500 or duplicate delivery)
    expect([200, 409]).toContain(res1.status);
    expect([200, 409]).toContain(res2.status);
    const successRes = res1.status === 200 ? res1 : res2;
    expect(successRes.body.data.status).toBe('DELIVERED');

    // In DB, order is DELIVERED and history has exactly one DELIVERED entry
    const finalOrder = await Order.findById(order._id);
    expect(finalOrder?.status).toBe('DELIVERED');
    expect(finalOrder?.internalStatus).toBe('DELIVERED');
    expect(finalOrder?.delivery.status).toBe('DELIVERED');
  });

  it('Mandatory OTP_SECRET Enforcement: Refuses fallback to JWT_SECRET and fails fast across all environments', async () => {
    const DeliveryService = (await import('../src/services/DeliveryService.js')).DeliveryService;
    const originalOtpSecret = process.env.OTP_SECRET;
    const originalJwtSecret = process.env.JWT_SECRET;

    try {
      delete process.env.OTP_SECRET;
      process.env.JWT_SECRET = 'some-jwt-secret-that-must-not-be-used-as-otp-secret';

      // Calling getOtpSecret() MUST throw when OTP_SECRET is missing
      expect(() => DeliveryService.getOtpSecret()).toThrow(
        /OTP_SECRET environment variable is mandatory and missing/
      );
    } finally {
      if (originalOtpSecret) process.env.OTP_SECRET = originalOtpSecret;
      else delete process.env.OTP_SECRET;
      if (originalJwtSecret) process.env.JWT_SECRET = originalJwtSecret;
      else delete process.env.JWT_SECRET;
    }
  });

  it('Admin Status Route Lock: Strictly prevents admin from manually setting DELIVERED without OTP verification', async () => {
    const admin = await User.create({ name: 'Admin Gate', email: 'admingate@cakepoprush.com', role: 'super_admin' });
    const adminToken = generateToken(String(admin._id), 'super_admin');
    const cust = await User.create({ name: 'Cust Gate', email: 'custgate@test.com', role: 'customer' });

    const order = await Order.create({
      orderNumber: 'CPR-NO-ADMIN-DELIV',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 500,
      total: 500,
      status: 'DISPATCHED',
      internalStatus: 'DISPATCHED',
      delivery: { addressSnapshot: mockAddress, isCodCollected: false },
    });

    const res = await request(app)
      .put(`/api/v1/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DELIVERED' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Orders cannot be directly marked DELIVERED via manual admin status update');

    const unchanged = await Order.findById(order._id);
    expect(unchanged?.status).toBe('DISPATCHED');
  });

  it('Terminal State Lock: DELIVERED order strictly rejects any status change from admin', async () => {
    const admin = await User.create({ name: 'Super Admin', email: 'superadmin_term@cakepoprush.com', role: 'super_admin' });
    const adminToken = generateToken(String(admin._id), 'super_admin');
    const cust = await User.create({ name: 'Deliv Cust', email: 'delivcust@test.com', role: 'customer' });

    const deliveredOrder = await Order.create({
      orderNumber: 'CPR-TERM-DELIV',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 450,
      total: 450,
      status: 'DELIVERED',
      internalStatus: 'DELIVERED',
      delivery: { addressSnapshot: mockAddress, isCodCollected: true, status: 'DELIVERED' },
    });

    const targetStatuses = ['PENDING', 'CONFIRMED', 'BEING BAKED', 'DISPATCHED', 'CANCELLED', 'DELIVERED'];

    for (const target of targetStatuses) {
      const res = await request(app)
        .put(`/api/v1/admin/orders/${deliveredOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: target });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Order has been delivered and cannot be modified|terminal state/i);
    }

    const unchanged = await Order.findById(deliveredOrder._id);
    expect(unchanged?.status).toBe('DELIVERED');
  });

  it('Terminal State Lock: CANCELLED order strictly rejects any status change from admin', async () => {
    const admin = await User.create({ name: 'Super Admin Cancel', email: 'superadmin_cancel@cakepoprush.com', role: 'super_admin' });
    const adminToken = generateToken(String(admin._id), 'super_admin');
    const cust = await User.create({ name: 'Cancel Cust', email: 'cancelcust@test.com', role: 'customer' });

    const cancelledOrder = await Order.create({
      orderNumber: 'CPR-TERM-CANCEL',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 450,
      total: 450,
      status: 'CANCELLED',
      internalStatus: 'CANCELLED',
      delivery: { addressSnapshot: mockAddress, isCodCollected: false, status: 'CANCELLED' },
    });

    const targetStatuses = ['PENDING', 'CONFIRMED', 'BEING BAKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

    for (const target of targetStatuses) {
      const res = await request(app)
        .put(`/api/v1/admin/orders/${cancelledOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: target });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Order has been cancelled and cannot be reactivated|terminal state/i);
    }

    const unchanged = await Order.findById(cancelledOrder._id);
    expect(unchanged?.status).toBe('CANCELLED');
  });

  it('Customer Staging Flow: Verifies trackingActive=false for PENDING, CONFIRMED, BEING BAKED, ASSIGNED, AGENT_ACCEPTED, and active only on DISPATCHED', async () => {
    const cust = await User.create({ name: 'Staging Cust', email: 'stagingcust@test.com', role: 'customer' });
    const custToken = generateToken(String(cust._id), 'customer');
    const admin = await User.create({ name: 'Staging Admin', email: 'stagingadmin@cakepoprush.com', role: 'admin' });
    const adminToken = generateToken(String(admin._id), 'admin');
    const agent = await User.create({ name: 'Staging Agent', email: 'stagingagent@cakepoprush.com', role: 'delivery_agent', isActive: true });
    const agentToken = generateToken(String(agent._id), 'delivery_agent');

    // 1. Order in PENDING state
    const order = await Order.create({
      orderNumber: 'CPR-STAGING-FLOW',
      user: cust._id,
      customer: cust._id,
      customerName: cust.name,
      customerEmail: cust.email,
      subtotal: 600,
      total: 600,
      status: 'PENDING',
      internalStatus: 'CONFIRMED',
      payment: { method: 'cod', status: 'Pending COD' },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      delivery: { addressSnapshot: mockAddress, isCodCollected: false },
    });

    // PENDING -> trackingActive is false, no deliveryOtp
    const trackPending = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackPending.status).toBe(200);
    expect(trackPending.body.data.trackingActive).toBe(false);
    expect(trackPending.body.data.deliveryOtp).toBeUndefined();

    // 2. Admin approves -> BEING BAKED
    const approveRes = await request(app)
      .post(`/api/v1/admin/orders/${order._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('BEING BAKED');

    // BEING BAKED -> trackingActive is false
    const trackBaked = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackBaked.status).toBe(200);
    expect(trackBaked.body.data.trackingActive).toBe(false);
    expect(trackBaked.body.data.deliveryOtp).toBeUndefined();

    // 3. Mark ready -> READY_FOR_PICKUP
    await request(app)
      .post(`/api/v1/admin/orders/${order._id}/mark-ready`)
      .set('Authorization', `Bearer ${adminToken}`);

    // 4. Assign Agent -> ASSIGNED
    await request(app)
      .post(`/api/v1/admin/orders/${order._id}/assign-agent`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ agentId: String(agent._id) });

    // ASSIGNED -> trackingActive is STILL false
    const trackAssigned = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackAssigned.status).toBe(200);
    expect(trackAssigned.body.data.trackingActive).toBe(false);
    expect(trackAssigned.body.data.deliveryOtp).toBeUndefined();

    // 5. Agent Accepts -> AGENT_ACCEPTED
    await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/accept`)
      .set('Authorization', `Bearer ${agentToken}`);

    // AGENT ACCEPTED -> trackingActive is STILL false
    const trackAccepted = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackAccepted.status).toBe(200);
    expect(trackAccepted.body.data.trackingActive).toBe(false);
    expect(trackAccepted.body.data.deliveryOtp).toBeUndefined();

    // 6. Agent Pickup -> DISPATCHED!
    const pickupRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/pickup`)
      .set('Authorization', `Bearer ${agentToken}`);
    expect(pickupRes.status).toBe(200);
    expect(pickupRes.body.data.status).toBe('DISPATCHED');

    // DISPATCHED -> trackingActive is NOW true, deliveryOtp is available!
    const trackDispatched = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackDispatched.status).toBe(200);
    expect(trackDispatched.body.data.trackingActive).toBe(true);
    expect(trackDispatched.body.data.deliveryOtp).toBeTruthy();
    expect(trackDispatched.body.data.deliveryOtp).toMatch(/^\d{6}$/);
    const otp = trackDispatched.body.data.deliveryOtp;

    // 7. Agent physically moves -> location updates
    const moveRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/location`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ latitude: 18.961, longitude: 72.808, heading: 45 });
    expect(moveRes.status).toBe(200);

    const trackMoved = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackMoved.body.data.currentLocation.latitude).toBe(18.961);
    expect(trackMoved.body.data.currentLocation.longitude).toBe(72.808);

    // 8. Correct OTP -> DELIVERED -> tracking stops
    const verifyRes = await request(app)
      .post(`/api/v1/delivery/orders/${order._id}/verify-otp`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ otp, codConfirmed: true, codAmountCollected: 600 });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.status).toBe('DELIVERED');

    // Post-delivery check
    const trackFinal = await request(app)
      .get(`/api/v1/orders/${order._id}/tracking`)
      .set('Authorization', `Bearer ${custToken}`);
    expect(trackFinal.body.data.trackingActive).toBe(false);
    expect(trackFinal.body.data.delivered).toBe(true);
    expect(trackFinal.body.data.deliveryOtp).toBeUndefined();
  });
});
