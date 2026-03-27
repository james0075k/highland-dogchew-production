import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  lookupSubscriptions,
  getSubscriptionOrders,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  createSetupIntent,
  updatePaymentMethod,
} from '../controllers/customerSubscriptionController.js';

const customerSubscriptionRoute = Router();

// Email-lookup and order-fetch endpoints — tighter limit (prevents enumeration)
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Action endpoints (cancel / pause / resume / card update)
const actionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

// POST /api/customer/subscriptions/lookup
customerSubscriptionRoute.post('/lookup', lookupLimiter, lookupSubscriptions);

// GET /api/customer/subscriptions/:subscriptionId/orders?email=
customerSubscriptionRoute.get('/:subscriptionId/orders', lookupLimiter, getSubscriptionOrders);

// PATCH /api/customer/subscriptions/:subscriptionId/cancel
customerSubscriptionRoute.patch('/:subscriptionId/cancel', actionLimiter, cancelSubscription);

// PATCH /api/customer/subscriptions/:subscriptionId/pause
customerSubscriptionRoute.patch('/:subscriptionId/pause', actionLimiter, pauseSubscription);

// PATCH /api/customer/subscriptions/:subscriptionId/resume
customerSubscriptionRoute.patch('/:subscriptionId/resume', actionLimiter, resumeSubscription);

// POST /api/customer/subscriptions/:subscriptionId/setup-intent
customerSubscriptionRoute.post('/:subscriptionId/setup-intent', actionLimiter, createSetupIntent);

// POST /api/customer/subscriptions/:subscriptionId/update-payment
customerSubscriptionRoute.post('/:subscriptionId/update-payment', actionLimiter, updatePaymentMethod);

export default customerSubscriptionRoute;
