import { Router } from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
} from '../controllers/newsletterController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const newsletterRoute = Router();

// Public
newsletterRoute.post('/subscribe', subscribeNewsletter);
newsletterRoute.post('/unsubscribe', unsubscribeNewsletter);

// Admin only — view all subscribers
newsletterRoute.get('/subscribers', authenticate, authorizeRoles('admin'), getSubscribers);

export default newsletterRoute;
