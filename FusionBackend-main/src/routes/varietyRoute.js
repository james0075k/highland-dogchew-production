import { Router } from 'express';
const varietyRoute = Router();
import {
  createVariety,
  getAllVarieties,
  getVarietyBySlug,
  getVarietyById,
  updateVariety,
  deleteVariety,
  getVarietiesByCategory,
  toggleVarietyStatus,
  getVarietyWithProducts
} from '../controllers/varietyController.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

// Public routes
varietyRoute.get('/', getAllVarieties);
varietyRoute.get('/slug/:slug', getVarietyBySlug);
varietyRoute.get('/category/:category', getVarietiesByCategory);
varietyRoute.get('/:id/products', getVarietyWithProducts); // NEW: Get variety with its products
varietyRoute.get('/:id', getVarietyById);

// Protected routes (admin only)
varietyRoute.post(
  '/',
  // authenticate,
  // authorizeRoles('admin'),
  singleUpload('image'),
  createVariety
);

varietyRoute.put(
  '/:id',
  // authenticate,
  // authorizeRoles('admin'),
  singleUpload('image'),
  updateVariety
);

varietyRoute.patch(
  '/:id/toggle-status',
  // authenticate,
  // authorizeRoles('admin'),
  toggleVarietyStatus
);

varietyRoute.delete(
  '/:id',
  // authenticate,
  // authorizeRoles('admin'),
  deleteVariety
);

export default varietyRoute;