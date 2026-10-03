import { Router } from 'express';
import {
  createCustomOrder,
  getMyCustomOrders,
  getCustomOrder,
  updateCustomOrder,
  getCustomOrderConfig,
} from '../../controllers/customOrders/customOrderController';
import {
  getAdminCustomOrderConfig,
  saveAdminCustomOrderConfigDraft,
  publishAdminCustomOrderConfig,
} from '../../controllers/admin/adminCustomOrderController';
import { optionalAuth, requireAuth, requireAdmin } from '../../middleware/authMiddleware';
import { customOrderSubmissionLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Storefront custom order form configuration
router.get('/config', getCustomOrderConfig);
router.get('/config/admin', requireAuth, requireAdmin, getAdminCustomOrderConfig);
router.post('/config/draft', requireAuth, requireAdmin, saveAdminCustomOrderConfigDraft);
router.post('/config/publish', requireAuth, requireAdmin, publishAdminCustomOrderConfig);

// Customer custom order creation (supports authenticated or guest with optionalAuth and abuse protection)
router.post('/', optionalAuth, customOrderSubmissionLimiter, createCustomOrder);

// Customer specific orders
router.get('/my-orders', requireAuth, getMyCustomOrders);

// Single custom order retrieval (authorized for owner or staff)
router.get('/:id', requireAuth, getCustomOrder);

// Customer custom order edit (requires auth, strict ownership and status validation)
router.patch('/:id', requireAuth, updateCustomOrder);

export default router;
