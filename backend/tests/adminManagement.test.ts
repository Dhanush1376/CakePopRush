import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';
import AdminInvite from '../src/models/AdminInvite';
import AdminAuditLog from '../src/models/AdminAuditLog';
import SessionAuthService from '../src/services/SessionAuthService';
import AdminInviteService from '../src/services/AdminInviteService';
import { bootstrapSuperAdmin } from '../src/config/adminConfig';

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
  process.env.SUPER_ADMIN_EMAIL = 'superadmin@cakepoprush.com';
});

describe('Admin Management & Super Admin Matrix - Phase 1B', () => {
  describe('Super Admin Bootstrap & Protection', () => {
    it('should promote user to super_admin when their email matches SUPER_ADMIN_EMAIL', async () => {
      const user = await User.create({
        name: 'Super Admin User',
        email: 'superadmin@cakepoprush.com',
        role: 'customer',
      });

      await bootstrapSuperAdmin();

      const refreshed = await User.findById(user._id);
      expect(refreshed?.role).toBe('super_admin');
    });

    it('should prevent modifying or demoting the configured super admin account', async () => {
      const superAdmin = await User.create({
        name: 'Primary Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });

      const adminUser = await User.create({
        name: 'Normal Admin',
        email: 'admin1@cakepoprush.com',
        role: 'admin',
      });

      const { accessToken: adminToken } = await SessionAuthService.createSession(adminUser, 'Vitest');

      // Attempt to change super_admin's role
      const roleRes = await request(app)
        .patch(`/api/v1/admin/users/${superAdmin._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'editor' });

      expect(roleRes.status).toBe(403);
      expect(roleRes.body.success).toBe(false);

      // Attempt to deactivate super_admin
      const statusRes = await request(app)
        .patch(`/api/v1/admin/users/${superAdmin._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });

      expect(statusRes.status).toBe(403);

      // Attempt to remove super_admin
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/users/${superAdmin._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(403);
    });

    it('should prevent an admin from modifying or revoking their own role', async () => {
      const admin = await User.create({
        name: 'Self Admin',
        email: 'selfadmin@cakepoprush.com',
        role: 'admin',
      });

      const { accessToken } = await SessionAuthService.createSession(admin, 'Vitest');

      const roleRes = await request(app)
        .patch(`/api/v1/admin/users/${admin._id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'super_admin' });

      expect(roleRes.status).toBe(400);

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/users/${admin._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toBe(400);
    });
  });

  describe('Role Hierarchy & Privilege Escalation Guards', () => {
    it('should block normal admin from assigning roles higher than or equal to their own clearance', async () => {
      const normalAdmin = await User.create({
        name: 'Normal Admin',
        email: 'regularadmin@cakepoprush.com',
        role: 'admin',
      });

      const target = await User.create({
        name: 'Target Editor',
        email: 'target@cakepoprush.com',
        role: 'editor',
      });

      const { accessToken } = await SessionAuthService.createSession(normalAdmin, 'Vitest');

      // Admin trying to promote editor to super_admin -> blocked
      const resSuper = await request(app)
        .patch(`/api/v1/admin/users/${target._id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'super_admin' });

      expect(resSuper.status).toBe(403);

      // Admin trying to promote editor to admin (equal weight 80) -> blocked
      const resAdmin = await request(app)
        .patch(`/api/v1/admin/users/${target._id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'admin' });

      expect(resAdmin.status).toBe(403);

      // Admin trying to change editor to viewer (lower weight 40) -> permitted
      const resViewer = await request(app)
        .patch(`/api/v1/admin/users/${target._id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'viewer' });

      expect(resViewer.status).toBe(200);
      expect(resViewer.body.success).toBe(true);
    });

    it('should block customer from accessing admin user management APIs', async () => {
      const customer = await User.create({
        name: 'Customer Bob',
        email: 'bob@gmail.com',
        role: 'customer',
      });

      const { accessToken } = await SessionAuthService.createSession(customer, 'Vitest');

      const resUsers = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(resUsers.status).toBe(403);

      const resStats = await request(app)
        .get('/api/v1/admin/user-stats')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(resStats.status).toBe(403);

      const resInvite = await request(app)
        .post('/api/v1/admin/invites')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'newadmin@cakepoprush.com', role: 'admin' });

      expect(resInvite.status).toBe(403);
    });
  });

  describe('Admin Invitation Lifecycle & Token Security', () => {
    it('should generate a secure sha256 tokenHash, allow acceptance, and enforce email matching', async () => {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });

      const { accessToken: adminToken } = await SessionAuthService.createSession(superAdmin, 'Vitest');

      // 1. Create invitation
      const inviteRes = await request(app)
        .post('/api/v1/admin/invites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'recipient@cakepoprush.com',
          role: 'admin',
          permissionsSummary: 'Manage catalog and orders',
        });

      expect(inviteRes.status).toBe(201);
      expect(inviteRes.body.success).toBe(true);

      const rawToken = inviteRes.body.data.rawToken;
      expect(rawToken).toBeDefined();

      // Verify token in DB is hashed and not stored in plaintext
      const dbInvite = await AdminInvite.findOne({ email: 'recipient@cakepoprush.com' });
      expect(dbInvite).not.toBeNull();
      expect(dbInvite?.tokenHash).toBeDefined();
      expect(dbInvite?.tokenHash).not.toBe(rawToken);

      // 2. Public verification of details by token
      const detailsRes = await request(app)
        .get(`/api/v1/admin/invites/details?token=${rawToken}`);

      expect(detailsRes.status).toBe(200);
      expect(detailsRes.body.data.email).toBe('recipient@cakepoprush.com');
      expect(detailsRes.body.data.roleAssigned).toBe('admin');

      // 3. Email mismatch check: Different authenticated user tries to accept
      const wrongUser = await User.create({
        name: 'Imposter User',
        email: 'imposter@gmail.com',
        role: 'customer',
      });
      const { accessToken: imposterToken } = await SessionAuthService.createSession(wrongUser, 'Vitest');

      const mismatchRes = await request(app)
        .post('/api/v1/admin/invites/accept')
        .set('Authorization', `Bearer ${imposterToken}`)
        .send({ token: rawToken });

      expect(mismatchRes.status).toBe(403);
      expect(mismatchRes.body.success).toBe(false);

      // 4. Correct user accepts invitation
      const rightUser = await User.create({
        name: 'Recipient User',
        email: 'recipient@cakepoprush.com',
        role: 'customer',
      });
      const { accessToken: recipientToken } = await SessionAuthService.createSession(rightUser, 'Vitest');

      const acceptRes = await request(app)
        .post('/api/v1/admin/invites/accept')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ token: rawToken });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.success).toBe(true);
      expect(acceptRes.body.data.role).toBe('admin');

      // Verify user in DB upgraded
      const upgradedUser = await User.findById(rightUser._id);
      expect(upgradedUser?.role).toBe('admin');

      // Verify invite status is accepted in DB
      const acceptedInvite = await AdminInvite.findById(dbInvite?._id);
      expect(acceptedInvite?.status).toBe('accepted');

      // 5. Replay attempt: Token cannot be reused
      const replayRes = await request(app)
        .post('/api/v1/admin/invites/accept')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ token: rawToken });

      expect(replayRes.status).toBe(404);
    });

    it('should successfully invite a brand new user whose email is not registered in the database', async () => {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });
      const { accessToken: adminToken } = await SessionAuthService.createSession(superAdmin, 'Vitest');

      // Verify the new email does not exist in User collection
      const nonExistentEmail = 'brandnewuser@gmail.com';
      const existing = await User.findOne({ email: nonExistentEmail });
      expect(existing).toBeNull();

      // Dispatch invite to new user
      const inviteRes = await request(app)
        .post('/api/v1/admin/invites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: nonExistentEmail,
          role: 'editor',
          permissionsSummary: 'Editor access for new team member',
        });

      expect(inviteRes.status).toBe(201);
      expect(inviteRes.body.success).toBe(true);
      expect(inviteRes.body.data.email).toBe(nonExistentEmail);
      expect(inviteRes.body.data.roleAssigned).toBe('editor');
      expect(inviteRes.body.data.status).toBe('pending');
      expect(inviteRes.body.data.rawToken).toBeDefined();

      // Verify listed in pending invites endpoint
      const pendingRes = await request(app)
        .get('/api/v1/admin/invites/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.data.invites.some((inv: any) => inv.email === nonExistentEmail)).toBe(true);
    });

    it('should support resending and revoking invitations', async () => {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });
      const { accessToken: adminToken } = await SessionAuthService.createSession(superAdmin, 'Vitest');

      const invite = await AdminInviteService.createInvite(
        String(superAdmin._id),
        'super_admin',
        'invite2@cakepoprush.com',
        'editor'
      );

      // Resend invitation
      const resendRes = await request(app)
        .post(`/api/v1/admin/invites/${invite._id}/resend`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resendRes.status).toBe(200);
      expect(resendRes.body.success).toBe(true);
      const newRawToken = resendRes.body.data.rawToken;
      expect(newRawToken).toBeDefined();

      // Revoke invitation
      const revokeRes = await request(app)
        .delete(`/api/v1/admin/invites/${invite._id}/revoke`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(revokeRes.status).toBe(200);

      // Verify revoked invite cannot be accepted
      const user = await User.create({
        name: 'Candidate',
        email: 'invite2@cakepoprush.com',
        role: 'customer',
      });
      const { accessToken: userToken } = await SessionAuthService.createSession(user, 'Vitest');

      const acceptRes = await request(app)
        .post('/api/v1/admin/invites/accept')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ token: newRawToken });

      expect(acceptRes.status).toBe(404);
    });

    it('should allow an admin to invite a user with delivery_agent role and assign delivery_agent on acceptance', async () => {
      const admin = await User.create({
        name: 'Fleet Manager Admin',
        email: 'fleetadmin@cakepoprush.com',
        role: 'admin',
      });
      const { accessToken: adminToken } = await SessionAuthService.createSession(admin, 'Vitest');

      // Dispatch invitation with delivery_agent role
      const inviteRes = await request(app)
        .post('/api/v1/admin/invites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'rider.rahul@cakepoprush.com',
          role: 'delivery_agent',
          permissionsSummary: 'Delivery Partner operational access',
        });

      expect(inviteRes.status).toBe(201);
      expect(inviteRes.body.success).toBe(true);
      const rawToken = inviteRes.body.data.rawToken;
      expect(rawToken).toBeDefined();

      // Delivery partner accepts
      const riderUser = await User.create({
        name: 'Rahul Rider',
        email: 'rider.rahul@cakepoprush.com',
        role: 'customer',
      });
      const { accessToken: riderToken } = await SessionAuthService.createSession(riderUser, 'Vitest');

      const acceptRes = await request(app)
        .post('/api/v1/admin/invites/accept')
        .set('Authorization', `Bearer ${riderToken}`)
        .send({ token: rawToken });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.success).toBe(true);
      expect(acceptRes.body.data.role).toBe('delivery_agent');

      // Verify DB role was updated
      const updatedRider = await User.findById(riderUser._id);
      expect(updatedRider?.role).toBe('delivery_agent');
    });
  });

  describe('Admin Users Listing, Filtering, Search, and Pagination', () => {
    it('should return server-backed search, role filter, status filter, and pagination', async () => {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });
      const { accessToken } = await SessionAuthService.createSession(superAdmin, 'Vitest');

      await User.create([
        { name: 'Alice Editor', email: 'alice@cakepoprush.com', role: 'editor', isLocked: false },
        { name: 'Bob Admin', email: 'bob@cakepoprush.com', role: 'admin', isLocked: false },
        { name: 'Charlie Viewer', email: 'charlie@cakepoprush.com', role: 'viewer', isLocked: true },
        { name: 'David Customer', email: 'david@gmail.com', role: 'customer', isLocked: false },
      ]);

      // 1. Search by name 'alice'
      const searchRes = await request(app)
        .get('/api/v1/admin/users?search=alice')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.users.length).toBe(1);
      expect(searchRes.body.data.users[0].name).toBe('Alice Editor');

      // 2. Filter by role 'editor'
      const roleRes = await request(app)
        .get('/api/v1/admin/users?role=editor')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(roleRes.status).toBe(200);
      expect(roleRes.body.data.users.length).toBe(1);
      expect(roleRes.body.data.users[0].role).toBe('Editor');

      // 3. Filter by status 'inactive'
      const statusRes = await request(app)
        .get('/api/v1/admin/users?status=inactive')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.users.length).toBe(1);
      expect(statusRes.body.data.users[0].name).toBe('Charlie Viewer');

      // 4. Pagination (excludes David Customer by default, only counts 4 staff users)
      const pageRes = await request(app)
        .get('/api/v1/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(pageRes.status).toBe(200);
      expect(pageRes.body.data.users.length).toBe(2);
      expect(pageRes.body.data.total).toBe(4);
      expect(pageRes.body.data.totalPages).toBe(2);

      // 5. Verify customers are excluded by default from admin staff listing
      const customerInDefaultRes = await request(app)
        .get('/api/v1/admin/users?search=david')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(customerInDefaultRes.body.data.users.length).toBe(0);

      // But can be queried explicitly if role=customer is requested
      const customerExplicitRes = await request(app)
        .get('/api/v1/admin/users?role=customer')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(customerExplicitRes.body.data.users.length).toBe(1);
      expect(customerExplicitRes.body.data.users[0].name).toBe('David Customer');
    });

    it('should create audit log entries for role updates and privilege revocations', async () => {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@cakepoprush.com',
        role: 'super_admin',
      });
      const editor = await User.create({
        name: 'Target Editor',
        email: 'editor@cakepoprush.com',
        role: 'editor',
      });
      const { accessToken } = await SessionAuthService.createSession(superAdmin, 'Vitest');

      // Update role
      await request(app)
        .patch(`/api/v1/admin/users/${editor._id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'admin' });

      const logs = await AdminAuditLog.find({ action: 'role_updated' });
      expect(logs.length).toBe(1);
      expect(logs[0].entityId).toBe(String(editor._id));
      expect(logs[0].newValue.role).toBe('admin');
    });
  });
});
