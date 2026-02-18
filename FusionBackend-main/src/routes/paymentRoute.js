import { Router } from 'express';
import { createCheckoutSession, stripeWebhookHandler } from '../controllers/paymentController.js';
import express from 'express';

const paymentRoute = Router();

paymentRoute.post('/create-checkout-session', createCheckoutSession);

// Use raw body parser for webhook
paymentRoute.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

export default paymentRoute;
