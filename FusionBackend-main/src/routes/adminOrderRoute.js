import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/adminOrderController.js';
import { authenticate } from '../middlewares/authMiddleware/authMiddleware.js';

const adminOrderRoute = Router();

// All routes require a valid admin JWT
adminOrderRoute.use(authenticate);

// GET  /api/admin/orders/stats      — summary stats
adminOrderRoute.get('/stats',        getOrderStats);

// GET  /api/admin/orders            — all orders (paginated)
adminOrderRoute.get('/',             getAllOrders);

// GET  /api/admin/orders/:id        — single order detail
adminOrderRoute.get('/:id',          getOrderById);

// PATCH /api/admin/orders/:id/status — update delivery status
adminOrderRoute.patch('/:id/status', updateOrderStatus);

export default adminOrderRoute;
