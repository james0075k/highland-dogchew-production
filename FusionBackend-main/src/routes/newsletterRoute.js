import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletterController.js';

const newsletterRoute = Router();

newsletterRoute.post('/subscribe', subscribeNewsletter);

export default newsletterRoute;
