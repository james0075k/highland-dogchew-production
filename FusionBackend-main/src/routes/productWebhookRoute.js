import { Router } from 'express';
import express from 'express';
import { handleProductWebhook } from '../controllers/productWebhookController.js';

const productWebhookRoute = Router();

// Stripe requires raw body for signature verification
productWebhookRoute.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleProductWebhook
);

export default productWebhookRoute;
