import { Router } from 'express';
import {
  verifyPromoCode,
  createPromoCode,
  updatePromoCode,
  getAllPromoCodes,
  deactivatePromoCode,
  deletePromoCode,
} from '../controllers/promoCodeController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { promoLimiter } from '../middlewares/rateLimit/rateLimiters.js';

const promoCodeRoute = Router();

// Public — verify a promo code (rate-limited: brute-force enumeration target)
promoCodeRoute.post('/verify', promoLimiter, verifyPromoCode);

// Admin only — create, edit, list, deactivate, delete
promoCodeRoute.post('/create', authenticate, authorizeRoles('admin'), createPromoCode);
promoCodeRoute.get('/', authenticate, authorizeRoles('admin'), getAllPromoCodes);
promoCodeRoute.patch('/:id', authenticate, authorizeRoles('admin'), updatePromoCode);
promoCodeRoute.patch('/:id/deactivate', authenticate, authorizeRoles('admin'), deactivatePromoCode);
promoCodeRoute.delete('/:id', authenticate, authorizeRoles('admin'), deletePromoCode);

export default promoCodeRoute;
