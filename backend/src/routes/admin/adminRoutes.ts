import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import { createAdminInvite } from '../../controllers/auth/adminInviteController';
import {
  getAdminMe,
  getAdminUsers,
  getAdminUserStats,
  updateAdminRole,
  updateAdminStatus,
  removeAdmin,
} from '../../controllers/admin/adminUsersController';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware';

import adminCustomOrderRoutes from './adminCustomOrderRoutes';
import { getAdminCustomOrderStats } from '../../controllers/admin/adminCustomOrderController';
import adminCustomerRoutes from './adminCustomerRoutes';
import { getCustomerStats } from '../../controllers/admin/adminCustomerController';
import {
  getAllOrders,
  getOrderStats,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  approveOrder,
  markOrderReady,
  assignDeliveryAgent,
  getDeliveryAgents,
  toggleDeliveryAgentStatus,
  createDeliveryAgent,
  deleteDeliveryAgent,
} from '../../controllers/admin/adminOrderController';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/me', getAdminMe);
router.get('/users', getAdminUsers);
router.get('/user-stats', getAdminUserStats);
router.patch('/users/:id/role', updateAdminRole);
router.patch('/users/:id/status', updateAdminStatus);
router.delete('/users/:id', removeAdmin);
router.post(
  '/users/invite',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.roleAssigned === 'delivery_agent' || req.body?.role === 'delivery_agent') {
      return createDeliveryAgent(req, res, next);
    }
    return createAdminInvite(req, res, next);
  })
);

// Order Management & Fulfillment
router.get('/orders', getAllOrders);
router.get('/order-stats', getOrderStats);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/status', updateAdminOrderStatus);
router.put('/orders/:id/status', updateAdminOrderStatus);
router.post('/orders/:id/approve', approveOrder);
router.post('/orders/:id/mark-ready', markOrderReady);
router.post('/orders/:id/assign-agent', assignDeliveryAgent);

// Delivery Agent Administration
router.get('/delivery-agents', getDeliveryAgents);
router.post('/delivery-agents', createDeliveryAgent);
router.patch('/delivery-agents/:id/status', toggleDeliveryAgentStatus);
router.delete('/delivery-agents/:id', deleteDeliveryAgent);

// Customer management
router.use('/customers', adminCustomerRoutes);
router.get('/customer-stats', getCustomerStats);

// Custom Orders Admin Sub-router & stats alias
router.use('/custom-orders', adminCustomOrderRoutes);
router.get('/custom-order-stats', getAdminCustomOrderStats);

export default router;
