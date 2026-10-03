import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/zodValidationMiddleware';
import { addWishlistItemSchema, mergeWishlistSchema } from '../../validators/wishlistValidator';
import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
  clearWishlistController,
  mergeWishlistController,
} from '../../controllers/wishlistController';

const router = Router();

// All wishlist customer endpoints require authenticated user session
router.use(requireAuth);

router.get('/', getWishlistController);
router.post('/items', validateRequest(addWishlistItemSchema), addToWishlistController);
router.delete('/items/:productId', removeFromWishlistController);
router.delete('/', clearWishlistController);
router.post('/merge', validateRequest(mergeWishlistSchema), mergeWishlistController);

export default router;
