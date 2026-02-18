import { Router } from 'express';
import {
  createReview,
  getAllReviews,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const ReviewRoute = Router();

// Public
ReviewRoute.post('/', createReview);
ReviewRoute.get('/', getAllReviews);
ReviewRoute.get('/product/:productId', getProductReviews);
ReviewRoute.get('/:tourId', getReviewById);

// Admin only
ReviewRoute.put('/:id', authenticate, authorizeRoles('admin'), updateReview);
ReviewRoute.delete('/:id', authenticate, authorizeRoles('admin'), deleteReview);

export default ReviewRoute;
