import { Router } from 'express';
import { validateCart, createPaymentIntent } from '../controllers/cartPaymentController.js';

const cartPaymentRoute = Router();

// POST /api/cart-payments/validate
cartPaymentRoute.post('/validate', validateCart);

// POST /api/cart-payments/create-payment-intent
cartPaymentRoute.post('/create-payment-intent', createPaymentIntent);

export default cartPaymentRoute;
