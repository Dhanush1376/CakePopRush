import { Router } from 'express';
import {
  getAgentOrders,
  getAgentOrderDetail,
  acceptDelivery,
  pickupDelivery,
  updateLocation,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  getDeliveryProfile,
  updateDeliveryStatus,
} from '../../controllers/deliveryController';
import { requireAuth, requireDeliveryAgent } from '../../middleware/authMiddleware';

const router = Router();

router.use(requireAuth, requireDeliveryAgent);

// Agent Profile & Availability
router.get('/me', getDeliveryProfile);
router.patch('/me/status', updateDeliveryStatus);

// Delivery Orders & Tasks
router.get('/orders', getAgentOrders);
router.get('/orders/:id', getAgentOrderDetail);
router.get('/tasks', getAgentOrders);
router.get('/tasks/:id', getAgentOrderDetail);

// Operational Delivery Lifecycle Actions
router.post('/orders/:id/accept', acceptDelivery);
router.post('/tasks/:id/accept', acceptDelivery);

router.post('/orders/:id/pickup', pickupDelivery);
router.post('/tasks/:id/pickup', pickupDelivery);

router.post('/orders/:id/location', updateLocation);
router.post('/tasks/:id/location', updateLocation);

// OTP Verification & Completion
router.post('/orders/:id/send-otp', sendDeliveryOtp);
router.post('/orders/:id/verify-otp', verifyDeliveryOtp);
router.post('/tasks/:id/verify-otp', verifyDeliveryOtp);

export default router;
