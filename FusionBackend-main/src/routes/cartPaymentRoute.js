import { Router } from 'express';
import {
  validateCart,
  createPaymentIntent,
  updatePaymentIntentMeta,
} from '../controllers/cartPaymentController.js';

const cartPaymentRoute = Router();

// POST /api/cart-payments/validate
cartPaymentRoute.post('/validate', validateCart);

// POST /api/cart-payments/create-payment-intent
cartPaymentRoute.post('/create-payment-intent', createPaymentIntent);

// POST /api/cart-payments/update-meta
// Attaches customer + shipping details to the PaymentIntent before confirm
cartPaymentRoute.post('/update-meta', updatePaymentIntentMeta);

export default cartPaymentRoute;
