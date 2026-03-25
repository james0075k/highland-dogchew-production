import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  validateCart,
  createPaymentIntent,
  updatePaymentIntentMeta,
} from '../controllers/cartPaymentController.js';

const cartPaymentRoute = Router();

// H-3 fix: rate limiting to prevent promo-code enumeration and PI-creation abuse
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // 30 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
});

const metaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

// POST /api/cart-payments/validate
cartPaymentRoute.post('/validate',              paymentLimiter, validateCart);

// POST /api/cart-payments/create-payment-intent
cartPaymentRoute.post('/create-payment-intent', paymentLimiter, createPaymentIntent);

// POST /api/cart-payments/update-meta
cartPaymentRoute.post('/update-meta',           metaLimiter,    updatePaymentIntentMeta);

export default cartPaymentRoute;
