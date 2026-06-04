import { Router } from 'express';
import { getLiveUsers } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authMiddleware/authMiddleware.js';

const analyticsRoute = Router();

// All routes require a valid admin JWT
analyticsRoute.use(authenticate);

// GET /api/admin/analytics/live — live active users (GA4 Realtime)
analyticsRoute.get('/live', getLiveUsers);

export default analyticsRoute;
