import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import productsData from '../src/data/seed/products.json';

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

describe('CakePopRush Cart Subsystem & Production Hardening Test Suite', () => {
  const sampleProduct = (productsData as any[])[0]; // e.g., prod_1

  describe('Security & Authentication Enforcement', () => {
    it('should reject unauthenticated GET /api/v1/cart with 401', async () => {
      const res = await request(app).get('/api/v1/cart');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated POST /api/v1/cart/items with 401', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .send({ productId: sampleProduct.id, quantity: 1 });
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated PATCH /api/v1/cart/items/sample-id with 401', async () => {
      const res = await request(app)
        .patch('/api/v1/cart/items/sample-id')
        .send({ quantity: 2 });
      expect(res.status).toBe(401);
    });

    it('should reject unauthenticated DELETE /api/v1/cart with 401', async () => {
      const res = await request(app).delete('/api/v1/cart');
      expect(res.status).toBe(401);
    });
  });

  describe('Authoritative Pricing & Line Item Identity', () => {
    it('calculates unit price authoritatively from product catalog and ignores client price spoofing', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: sampleProduct.id,
          quantity: 2,
          price: 1, // Malicious spoofed price
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cart = res.body.data;
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].price).toBe(sampleProduct.basePrice);
      expect(cart.subtotal).toBe(sampleProduct.basePrice * 2);
    });

    it('aggregates quantities for identical product and customization', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test2@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      // Add item once
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: sampleProduct.id,
          quantity: 2,
          variantId: 'flav_1',
        });

      // Add same item again
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: sampleProduct.id,
          quantity: 3,
          variantId: 'flav_1',
        });

      expect(res.status).toBe(200);
      const cart = res.body.data;
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalItems).toBe(5);
    });

    it('creates distinct cart lines for different variants/customizations of same product', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test3@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: sampleProduct.id,
          quantity: 1,
          variantId: 'flavor_chocolate',
          customization: { flavourName: 'Chocolate' },
        });

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: sampleProduct.id,
          quantity: 1,
          variantId: 'flavor_vanilla',
          customization: { flavourName: 'Vanilla' },
        });

      expect(res.status).toBe(200);
      const cart = res.body.data;
      expect(cart.items).toHaveLength(2);
      expect(cart.totalItems).toBe(2);
    });
  });

  describe('Quantity Management & Validation', () => {
    it('rejects negative quantity updates with 400', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test4@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      const res = await request(app)
        .patch('/api/v1/cart/items/sample_item')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: -5 });

      expect(res.status).toBe(400);
    });

    it('rejects excessive quantities over 99 with 400', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test5@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      const res = await request(app)
        .patch('/api/v1/cart/items/sample_item')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 150 });

      expect(res.status).toBe(400);
    });

    it('removes item when quantity is updated to 0', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test6@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      const addRes = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: sampleProduct.id, quantity: 2 });

      const itemId = addRes.body.data.items[0].id;

      const updateRes = await request(app)
        .patch(`/api/v1/cart/items/${encodeURIComponent(itemId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 0 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.items).toHaveLength(0);
      expect(updateRes.body.data.totalItems).toBe(0);
    });
  });

  describe('Item Removal & Clear Cart', () => {
    it('removes a specific line item', async () => {
      const user = await User.create({
        name: 'Test Customer',
        email: 'test7@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      const addRes = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: sampleProduct.id, quantity: 1 });

      const itemId = addRes.body.data.items[0].id;

      const delRes = await request(app)
        .delete(`/api/v1/cart/items/${encodeURIComponent(itemId)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.items).toHaveLength(0);
    });

    it('clears all items securely without affecting other users', async () => {
      const userA = await User.create({
        name: 'Customer A',
        email: 'usera@cakepoprush.com',
        role: 'customer',
      });
      const userB = await User.create({
        name: 'Customer B',
        email: 'userb@cakepoprush.com',
        role: 'customer',
      });
      const tokenA = generateToken(String(userA._id));
      const tokenB = generateToken(String(userB._id));

      // Both add items
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ productId: sampleProduct.id, quantity: 1 });

      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ productId: sampleProduct.id, quantity: 2 });

      // User A clears cart
      const clearRes = await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(clearRes.status).toBe(200);
      expect(clearRes.body.data.items).toHaveLength(0);

      // Verify User B's cart remains completely intact!
      const userBCartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(userBCartRes.status).toBe(200);
      expect(userBCartRes.body.data.items).toHaveLength(1);
      expect(userBCartRes.body.data.items[0].quantity).toBe(2);
    });
  });

  describe('Guest to Authenticated Cart Merge', () => {
    it('merges guest items into authenticated user cart without duplication', async () => {
      const user = await User.create({
        name: 'Merging Customer',
        email: 'merge@cakepoprush.com',
        role: 'customer',
      });
      const token = generateToken(String(user._id));

      // User already has 1 of sampleProduct
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: sampleProduct.id, quantity: 1 });

      // Guest had 2 of sampleProduct + 1 of second product
      const secondProduct = (productsData as any[])[1];
      const guestItems = [
        { productId: sampleProduct.id, quantity: 2 },
        { productId: secondProduct.id, quantity: 1 },
        { productId: 'non_existent_product_999', quantity: 1 }, // Stale item should be dropped
      ];

      const mergeRes = await request(app)
        .post('/api/v1/cart/merge')
        .set('Authorization', `Bearer ${token}`)
        .send({ items: guestItems });

      expect(mergeRes.status).toBe(200);
      const cart = mergeRes.body.data;
      expect(cart.items).toHaveLength(2); // sampleProduct + secondProduct
      const sampleItem = cart.items.find((i: any) => i.productId === sampleProduct.id);
      expect(sampleItem.quantity).toBe(3); // 1 (existing) + 2 (guest)
      expect(cart.droppedItems).toBeDefined();
      expect(cart.droppedItems[0].productId).toBe('non_existent_product_999');
    });
  });
});
