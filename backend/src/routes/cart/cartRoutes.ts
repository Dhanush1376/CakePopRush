import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/zodValidationMiddleware';
import {
  addItemSchema,
  updateQuantitySchema,
  mergeCartSchema,
} from '../../validators/cartValidator';
import {
  getCartController,
  addToCartController,
  updateQuantityController,
  removeItemController,
  clearCartController,
  mergeCartController,
} from '../../controllers/cartController';

const router = Router();

// All cart endpoints require authenticated user session
router.use(requireAuth);

router.get('/', getCartController);
router.post('/items', validateRequest(addItemSchema), addToCartController);
router.patch('/items/:itemId', validateRequest(updateQuantitySchema), updateQuantityController);
router.delete('/items/:itemId', removeItemController);
router.delete('/', clearCartController);
router.post('/merge', validateRequest(mergeCartSchema), mergeCartController);

export default router;
