import { Router } from 'express';
import { verifyPromoCode, createPromoCode, getAllPromoCodes } from '../controllers/promoCodeController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const promoCodeRoute = Router();

// Public — verify a promo code
promoCodeRoute.post('/verify', verifyPromoCode);

// Admin only — create a promo code
promoCodeRoute.post('/create', authenticate, authorizeRoles('admin'), createPromoCode);

// Admin only — list all promo codes
promoCodeRoute.get('/', authenticate, authorizeRoles('admin'), getAllPromoCodes);

export default promoCodeRoute;
