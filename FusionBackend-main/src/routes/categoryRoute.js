import { Router } from 'express';
import { createCategory, getAllCategories, deleteCategory } from '../controllers/categoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const categoryRoute = Router();

// Public
categoryRoute.get('/', getAllCategories);

// Admin only
categoryRoute.post('/', authenticate, authorizeRoles('admin'), createCategory);
categoryRoute.delete('/:id', authenticate, authorizeRoles('admin'), deleteCategory);

export default categoryRoute;
