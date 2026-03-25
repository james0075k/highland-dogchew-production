import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getOrderByPaymentIntent,
  getUserOrders,
  syncOrderFromPaymentIntent,
  trackOrder,
  getMyOrders,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware/authMiddleware.js';

const orderRoute = Router();

// Rate limiter for public lookup endpoints — prevents enumeration / bulk harvesting
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// POST /api/orders/sync — create order from Stripe PI (works without webhook)
orderRoute.post('/sync', syncOrderFromPaymentIntent);

// POST /api/orders/track — public parcel tracking (orderNumber + email)
orderRoute.post('/track', lookupLimiter, trackOrder);

// POST /api/orders/my-orders — fetch all orders for an email address (rate-limited)
orderRoute.post('/my-orders', lookupLimiter, getMyOrders);

// GET /api/orders/payment-intent/:paymentIntentId — used by success page
orderRoute.get('/payment-intent/:paymentIntentId', lookupLimiter, getOrderByPaymentIntent);

// GET /api/orders — admin only
orderRoute.get('/', authenticate, getUserOrders);

export default orderRoute;
