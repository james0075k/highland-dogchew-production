import { Router } from 'express';
const blogCategory = Router();

import { createCategory, deleteBlogCategory, getAllCategories } from '../controllers/blogCategoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

blogCategory.post('/', authenticate, authorizeRoles('admin'),  createCategory);
blogCategory.get('/', getAllCategories);
blogCategory.delete('/:id', authenticate, authorizeRoles('admin'),  deleteBlogCategory);

export default blogCategory;
