import { Router } from 'express';
import {
  createOrder,
  getOrderByPaymentIntent,
  getUserOrders,
  syncOrderFromPaymentIntent,
  trackOrder,
  getMyOrders,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware/authMiddleware.js';

const orderRoute = Router();

// POST /api/orders/create
orderRoute.post('/create', createOrder);

// POST /api/orders/sync — create order from Stripe PI (works without webhook)
orderRoute.post('/sync', syncOrderFromPaymentIntent);

// POST /api/orders/track — public parcel tracking (orderNumber + email)
orderRoute.post('/track', trackOrder);

// POST /api/orders/my-orders — fetch all orders for an email address
orderRoute.post('/my-orders', getMyOrders);

// GET /api/orders/payment-intent/:paymentIntentId
orderRoute.get('/payment-intent/:paymentIntentId', getOrderByPaymentIntent);

// GET /api/orders — admin only
orderRoute.get('/', authenticate, getUserOrders);

export default orderRoute;
