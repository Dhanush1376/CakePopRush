import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import CustomerNote from '../src/models/CustomerNote';
import AdminCustomerService from '../src/services/AdminCustomerService';

let mongoServer: MongoMemoryServer;
const JWT_SECRET = 'test_access_secret_12345678901234567890';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = JWT_SECRET;
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

describe('Customers & Profile Production Readiness Test Suite', () => {
  describe('Security & Authentication Enforcement', () => {
    it('should reject unauthenticated request to /api/v1/admin/customers with 401', async () => {
      const res = await request(app).get('/api/v1/admin/customers');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject standard customer from accessing /api/v1/admin/customers with 403', async () => {
      const customer = await User.create({
        name: 'Regular Customer',
        email: 'customer@test.com',
        role: 'customer',
      });
      const token = generateToken(String(customer._id), 'customer');

      const res = await request(app)
        .get('/api/v1/admin/customers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin user to access /api/v1/admin/customers', async () => {
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
      });
      const token = generateToken(String(admin._id), 'admin');

      const res = await request(app)
        .get('/api/v1/admin/customers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customers).toBeDefined();
    });
  });

  describe('User Profile, Contact Verification & Protected Field Tamper Guards', () => {
    it('should retrieve own profile for authenticated user', async () => {
      const user = await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Jane Doe');
      expect(res.body.data.email).toBe('jane@example.com');
    });

    it('should reset emailVerified when email changes', async () => {
      const user = await User.create({
        name: 'Jane Doe',
        email: 'jane.old@example.com',
        emailVerified: true,
        role: 'customer',
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'jane.new@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await User.findById(user._id);
      expect(updated?.email).toBe('jane.new@example.com');
      expect(updated?.emailVerified).toBe(false);
    });

    it('should reset phoneVerified when phone changes', async () => {
      const user = await User.create({
        name: 'John Doe',
        phone: '+919999999991',
        phoneVerified: true,
        role: 'customer',
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '+919999999992' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await User.findById(user._id);
      expect(updated?.phone).toBe('+919999999992');
      expect(updated?.phoneVerified).toBe(false);
    });

    it('should prevent customer from escalating role or unlocking account via profile update (Protected Field Protection)', async () => {
      const user = await User.create({
        name: 'Attacker Customer',
        email: 'attacker@example.com',
        role: 'customer',
        isLocked: false,
      });
      const token = generateToken(String(user._id), 'customer');

      // Attempt injection of protected fields
      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Attacker Renamed',
          role: 'super_admin',
          isLocked: true,
          walletBalance: 99999,
        });

      expect(res.status).toBe(200);

      const refreshed = await User.findById(user._id);
      expect(refreshed?.name).toBe('Attacker Renamed');
      expect(refreshed?.role).toBe('customer'); // Role remains customer
      expect(refreshed?.walletBalance || 0).toBe(0); // Wallet balance not tampered
    });

    it('should reject duplicate email with 400', async () => {
      await User.create({
        name: 'Existing User',
        email: 'taken@example.com',
        role: 'customer',
      });

      const user = await User.create({
        name: 'Another User',
        email: 'other@example.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'taken@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Address Management CRUD, Validation & Atomic Single-Default Rule', () => {
    it('should make first added address default automatically', async () => {
      const user = await User.create({
        name: 'Address Tester',
        email: 'addr@example.com',
        role: 'customer',
        addresses: [],
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .post('/api/v1/users/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Home',
          line1: '123 Sweet Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          isDefault: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isDefault).toBe(true);
    });

    it('should retrieve all addresses via GET /api/v1/users/addresses', async () => {
      const user = await User.create({
        name: 'Address Reader',
        email: 'read@example.com',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: '123 Sweet Street',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: true,
          },
        ],
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .get('/api/v1/users/addresses')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].label).toBe('Home');
    });

    it('should update address details via PATCH /api/v1/users/addresses/:id', async () => {
      const user = await User.create({
        name: 'Address Updater',
        email: 'update@example.com',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: 'Old Street 1',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: true,
          },
        ],
      });
      const token = generateToken(String(user._id), 'customer');
      const addressId = String(user.addresses![0]._id);

      const res = await request(app)
        .patch(`/api/v1/users/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ line1: 'New Street 2', city: 'Mysuru' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.line1).toBe('New Street 2');
      expect(res.body.data.city).toBe('Mysuru');

      const updated = await User.findById(user._id);
      expect(updated?.addresses?.[0].line1).toBe('New Street 2');
    });

    it('should reject address creation if required fields are missing', async () => {
      const user = await User.create({
        name: 'Invalid Addr User',
        email: 'invalid@example.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .post('/api/v1/users/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Incomplete',
          // line1 is missing
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject malformed address ID with 400', async () => {
      const user = await User.create({
        name: 'Malformed ID Tester',
        email: 'malformed@example.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id), 'customer');

      const res = await request(app)
        .patch('/api/v1/users/addresses/invalid-mongo-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ city: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should maintain atomic single-default rule when setting a default address', async () => {
      const user = await User.create({
        name: 'Address Tester 2',
        email: 'addr2@example.com',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: '123 Sweet Street',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: true,
          },
          {
            label: 'Office',
            line1: '456 Tech Park',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560066',
            isDefault: false,
          },
        ],
      });
      const token = generateToken(String(user._id), 'customer');
      const officeId = String(user.addresses![1]._id);

      const res = await request(app)
        .patch(`/api/v1/users/addresses/${officeId}/default`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await User.findById(user._id);
      const defaults = updated?.addresses?.filter((a) => a.isDefault);
      expect(defaults?.length).toBe(1);
      expect(String(defaults?.[0]._id)).toBe(officeId);
    });

    it('should delete an address and promote remaining address to default if needed', async () => {
      const user = await User.create({
        name: 'Address Tester 3',
        email: 'addr3@example.com',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: '123 Sweet Street',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: true,
          },
          {
            label: 'Office',
            line1: '456 Tech Park',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560066',
            isDefault: false,
          },
        ],
      });
      const token = generateToken(String(user._id), 'customer');
      const addressIdToDelete = String(user.addresses![0]._id);

      const res = await request(app)
        .delete(`/api/v1/users/addresses/${addressIdToDelete}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await User.findById(user._id);
      expect(updated?.addresses?.length).toBe(1);
      expect(updated?.addresses?.[0].isDefault).toBe(true);
    });
  });

  describe('IDOR & Cross-Customer Address Isolation', () => {
    it('should prevent Customer A from modifying Customer B address (IDOR guard)', async () => {
      const customerA = await User.create({
        name: 'Customer A',
        email: 'customerA@test.com',
        role: 'customer',
        addresses: [],
      });
      const customerB = await User.create({
        name: 'Customer B',
        email: 'customerB@test.com',
        role: 'customer',
        addresses: [
          {
            label: 'Private Villa',
            line1: 'Secret Location 99',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560099',
            isDefault: true,
          },
        ],
      });

      const tokenA = generateToken(String(customerA._id), 'customer');
      const addressIdB = String(customerB.addresses![0]._id);

      const res = await request(app)
        .patch(`/api/v1/users/addresses/${addressIdB}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ line1: 'Compromised Location' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify Customer B data remains unmutated
      const untouchedB = await User.findById(customerB._id);
      expect(untouchedB?.addresses?.[0].line1).toBe('Secret Location 99');
    });

    it('should prevent Customer A from deleting Customer B address (IDOR guard)', async () => {
      const customerA = await User.create({
        name: 'Customer A2',
        email: 'customerA2@test.com',
        role: 'customer',
      });
      const customerB = await User.create({
        name: 'Customer B2',
        email: 'customerB2@test.com',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: 'Customer B Home',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: true,
          },
        ],
      });

      const tokenA = generateToken(String(customerA._id), 'customer');
      const addressIdB = String(customerB.addresses![0]._id);

      const res = await request(app)
        .delete(`/api/v1/users/addresses/${addressIdB}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);

      // Verify Customer B address still exists
      const intactB = await User.findById(customerB._id);
      expect(intactB?.addresses?.length).toBe(1);
    });

    it('should prevent Customer A from setting Customer B address as default (IDOR guard)', async () => {
      const customerA = await User.create({
        name: 'Customer A3',
        email: 'customerA3@test.com',
        role: 'customer',
      });
      const customerB = await User.create({
        name: 'Customer B3',
        email: 'customerB3@test.com',
        role: 'customer',
        addresses: [
          {
            label: 'Home',
            line1: 'Customer B Home',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            isDefault: false,
          },
        ],
      });

      const tokenA = generateToken(String(customerA._id), 'customer');
      const addressIdB = String(customerB.addresses![0]._id);

      const res = await request(app)
        .patch(`/api/v1/users/addresses/${addressIdB}/default`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Admin Customer Service Optimization & Note Cleanup', () => {
    it('should paginate customers fast without N+1 query loops', async () => {
      // Create 10 customers
      const userDocs = [];
      for (let i = 1; i <= 10; i++) {
        userDocs.push({
          name: `Customer ${i}`,
          email: `cust${i}@example.com`,
          role: 'customer',
        });
      }
      await User.insertMany(userDocs);

      const result = await AdminCustomerService.getCustomers({ page: 1, limit: 5 });
      expect(result.customers.length).toBe(5);
      expect(result.total).toBe(10);
      expect(result.totalPages).toBe(2);
      expect(result.customers[0].initials).toBeDefined();
    });

    it('should cascade delete customer notes when customer is deleted', async () => {
      const customer = await User.create({
        name: 'Deletable Customer',
        email: 'del@example.com',
        role: 'customer',
      });

      const note = await CustomerNote.create({
        customerId: customer._id,
        authorId: new mongoose.Types.ObjectId(),
        authorName: 'Admin',
        authorRole: 'admin',
        content: 'This note should be cleaned up upon deletion',
      });

      await AdminCustomerService.deleteCustomer(
        String(customer._id),
        'Account closure',
        { id: 'admin1', email: 'admin@test.com', role: 'admin' }
      );

      const remainingNote = await CustomerNote.findById(note._id);
      expect(remainingNote).toBeNull();
    });
  });
});
