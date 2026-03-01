import { Router } from 'express';
import {
  createOrder,
  getOrderByPaymentIntent,
  getUserOrders,
  syncOrderFromPaymentIntent,
} from '../controllers/orderController.js';

const orderRoute = Router();

// POST /api/orders/create
orderRoute.post('/create', createOrder);

// POST /api/orders/sync — create order from Stripe PI (works without webhook)
orderRoute.post('/sync', syncOrderFromPaymentIntent);

// GET /api/orders/payment-intent/:paymentIntentId
orderRoute.get('/payment-intent/:paymentIntentId', getOrderByPaymentIntent);

// GET /api/orders — list all orders (future: add auth)
orderRoute.get('/', getUserOrders);

export default orderRoute;
