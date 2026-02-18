import { Router } from 'express';
import { createTourCategory, deleteTourCategory, getAllTourCategories, getTourCategoryBySlug } from '../controllers/tourCategoryController.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
const tourCategoryRoute = Router();

tourCategoryRoute.post('/', singleUpload('image'), authenticate, authorizeRoles('admin'),  createTourCategory);
tourCategoryRoute.get('/', getAllTourCategories);
tourCategoryRoute.get('/:slug', getTourCategoryBySlug); // Get by slug
tourCategoryRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteTourCategory)

export default tourCategoryRoute;

