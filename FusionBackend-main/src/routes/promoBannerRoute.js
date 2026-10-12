import { Router } from 'express';
import { getPublicBanner, getAdminBanner, saveBanner } from '../controllers/promoBannerController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const promoBannerRoute = Router();

// Public — the homepage strip and /discount-code read this
promoBannerRoute.get('/', getPublicBanner);

// Admin only — edit the banner
promoBannerRoute.get('/admin', authenticate, authorizeRoles('admin', 'superadmin'), getAdminBanner);
promoBannerRoute.put('/', authenticate, authorizeRoles('admin', 'superadmin'), saveBanner);

export default promoBannerRoute;
