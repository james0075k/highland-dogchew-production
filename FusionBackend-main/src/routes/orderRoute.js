import { Router } from 'express';
import {
  createOrder,
  getOrderByPaymentIntent,
  getUserOrders,
  syncOrderFromPaymentIntent,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware/authMiddleware.js';

const orderRoute = Router();

// POST /api/orders/create
orderRoute.post('/create', createOrder);

// POST /api/orders/sync — create order from Stripe PI (works without webhook)
orderRoute.post('/sync', syncOrderFromPaymentIntent);

// GET /api/orders/payment-intent/:paymentIntentId
orderRoute.get('/payment-intent/:paymentIntentId', getOrderByPaymentIntent);

// GET /api/orders — admin only
orderRoute.get('/', authenticate, getUserOrders);

export default orderRoute;
