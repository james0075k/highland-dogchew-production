import { Router } from 'express';
import { verifyPromoCode, createPromoCode, getAllPromoCodes, deactivatePromoCode } from '../controllers/promoCodeController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { promoLimiter } from '../middlewares/rateLimit/rateLimiters.js';

const promoCodeRoute = Router();

// Public — verify a promo code (rate-limited: brute-force enumeration target)
promoCodeRoute.post('/verify', promoLimiter, verifyPromoCode);

// Admin only — create a promo code
promoCodeRoute.post('/create', authenticate, authorizeRoles('admin'), createPromoCode);

// Admin only — list all promo codes
promoCodeRoute.get('/', authenticate, authorizeRoles('admin'), getAllPromoCodes);

// Admin only — deactivate a promo code (DB + Stripe)
promoCodeRoute.patch('/:id/deactivate', authenticate, authorizeRoles('admin'), deactivatePromoCode);

export default promoCodeRoute;
