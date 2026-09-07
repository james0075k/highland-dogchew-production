import { Router } from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  unsubscribeByToken,
  getSubscribers,
} from '../controllers/newsletterController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { newsletterLimiter } from '../middlewares/rateLimit/rateLimiters.js';

const newsletterRoute = Router();

// Public — rate-limited to prevent signup spam
newsletterRoute.post('/subscribe', newsletterLimiter, subscribeNewsletter);
newsletterRoute.post('/unsubscribe', newsletterLimiter, unsubscribeNewsletter);

// Unsubscribe links in marketing email. Deliberately NOT rate-limited: honouring
// an opt-out is an obligation, and a shared corporate IP must never be the
// reason someone can't get off the list. GET is the footer link a person clicks;
// POST is the RFC 8058 one-click that Gmail and Outlook fire on their own.
newsletterRoute.get('/unsubscribe/:token', unsubscribeByToken);
newsletterRoute.post('/unsubscribe/:token', unsubscribeByToken);

// Admin only — view all subscribers
newsletterRoute.get('/subscribers', authenticate, authorizeRoles('admin', 'superadmin'), getSubscribers);

export default newsletterRoute;
