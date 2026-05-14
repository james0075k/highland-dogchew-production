/**
 * Builds a minimal Express app with just the routes we test, so we don't load
 * the full server (which includes cron, listen(), DB-connect-then-listen).
 */
import express from 'express';
import cartPaymentRoute from '../../src/routes/cartPaymentRoute.js';
import productWebhookRoute from '../../src/routes/productWebhookRoute.js';
import promoCodeRoute from '../../src/routes/promoCodeRoute.js';
import errorMiddleware from '../../src/middlewares/ErrorMiddleware/errorMiddleware.js';

export function buildApp() {
  const app = express();

  // Webhook gets raw body BEFORE json parser
  app.use('/api/webhook', productWebhookRoute);

  app.use(express.json());
  app.use('/api/cart-payments', cartPaymentRoute);
  app.use('/api/promo', promoCodeRoute);
  app.use(errorMiddleware);
  return app;
}
