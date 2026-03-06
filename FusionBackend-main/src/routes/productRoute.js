import { Router } from 'express';
const productRoute = Router();
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByVariety,
  getFeaturedProducts,
  getProductsByType
} from '../controllers/productController.js';
import { singleUpload, arrayUpload, fieldsUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

// Public routes
productRoute.get('/', getAllProducts);
productRoute.get('/featured', getFeaturedProducts);
productRoute.get('/type/:type', getProductsByType);
productRoute.get('/slug/:slug', getProductBySlug);
productRoute.get('/category/:category', getProductsByCategory);
productRoute.get('/variety/:varietyId', getProductsByVariety); // NEW: Get products by variety
productRoute.get('/:id', getProductById);

// Protected routes (admin only)
productRoute.post(
  "/",
  authenticate,
  authorizeRoles('admin'),
  fieldsUpload([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createProduct
);

productRoute.put(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  fieldsUpload([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateProduct
);

productRoute.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  deleteProduct
);

export default productRoute;