import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getOrderTracking,
} from '../../controllers/orderController';
import { requireAuth, optionalAuth } from '../../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, createOrder);
router.post('/verify-payment', requireAuth, verifyPayment);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
router.get('/:id/tracking', optionalAuth, getOrderTracking);

export default router;
