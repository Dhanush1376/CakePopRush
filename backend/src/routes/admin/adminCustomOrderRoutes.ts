import { Router } from 'express';
import {
  getAdminCustomOrders,
  getAdminCustomOrderStats,
  getAdminCustomOrderById,
  updateAdminCustomOrderStatus,
  updateAdminCustomOrderNotes,
  deleteAdminCustomOrder,
  getAdminCustomOrderConfig,
  saveAdminCustomOrderConfigDraft,
  publishAdminCustomOrderConfig,
} from '../../controllers/admin/adminCustomOrderController';

const router = Router();

router.get('/stats', getAdminCustomOrderStats);
router.get('/config', getAdminCustomOrderConfig);
router.post('/config/draft', saveAdminCustomOrderConfigDraft);
router.post('/config/publish', publishAdminCustomOrderConfig);

router.get('/', getAdminCustomOrders);
router.get('/:id', getAdminCustomOrderById);
router.patch('/:id/status', updateAdminCustomOrderStatus);
router.patch('/:id/notes', updateAdminCustomOrderNotes);
router.delete('/:id', deleteAdminCustomOrder);

export default router;
