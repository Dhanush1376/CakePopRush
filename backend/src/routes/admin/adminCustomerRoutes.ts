import { Router } from 'express';
import {
  getCustomers,
  getCustomerStats,
  getCustomer360,
  getCustomerOrders,
  getCustomerCustomOrders,
  updateCustomerStatus,
  deleteCustomer,
  bulkUpdateCustomerStatus,
  bulkDeleteCustomers,
  getCustomerNotes,
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
} from '../../controllers/admin/adminCustomerController';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Strict security: all customer administration endpoints require staff authentication
router.use(requireAuth, requireAdmin);

// Customer stats
router.get('/stats', getCustomerStats);

// Customer list
router.get('/', getCustomers);

// Bulk operations
router.patch('/bulk-status', bulkUpdateCustomerStatus);
router.post('/bulk-delete', bulkDeleteCustomers);

// Single customer details & sub-resources
router.get('/:id', getCustomer360);
router.patch('/:id/status', updateCustomerStatus);
router.delete('/:id', deleteCustomer);
router.get('/:id/orders', getCustomerOrders);
router.get('/:id/custom-orders', getCustomerCustomOrders);

// Notes on customer
router.get('/:id/notes', getCustomerNotes);
router.post('/:id/notes', addCustomerNote);
router.patch('/notes/:noteId', updateCustomerNote);
router.delete('/notes/:noteId', deleteCustomerNote);

export default router;
