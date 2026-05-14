import { Router } from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
} from '../controllers/newsletterController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { newsletterLimiter } from '../middlewares/rateLimit/rateLimiters.js';

const newsletterRoute = Router();

// Public — rate-limited to prevent signup spam
newsletterRoute.post('/subscribe', newsletterLimiter, subscribeNewsletter);
newsletterRoute.post('/unsubscribe', newsletterLimiter, unsubscribeNewsletter);

// Admin only — view all subscribers
newsletterRoute.get('/subscribers', authenticate, authorizeRoles('admin'), getSubscribers);

export default newsletterRoute;
