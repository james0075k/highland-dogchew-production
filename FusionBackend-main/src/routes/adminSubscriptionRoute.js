import { Router } from 'express';
import {
  getSubscriptionStats,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus,
} from '../controllers/adminSubscriptionController.js';
import { authenticate } from '../middlewares/authMiddleware/authMiddleware.js';

const adminSubscriptionRoute = Router();

// All routes require a valid admin JWT
adminSubscriptionRoute.use(authenticate);

// GET  /api/admin/subscriptions/stats    — summary stats
adminSubscriptionRoute.get('/stats', getSubscriptionStats);

// GET  /api/admin/subscriptions          — all subscriptions (paginated)
adminSubscriptionRoute.get('/', getAllSubscriptions);

// GET  /api/admin/subscriptions/:id      — single subscription detail
adminSubscriptionRoute.get('/:id', getSubscriptionById);

// PATCH /api/admin/subscriptions/:id/status — update status
adminSubscriptionRoute.patch('/:id/status', updateSubscriptionStatus);

export default adminSubscriptionRoute;
