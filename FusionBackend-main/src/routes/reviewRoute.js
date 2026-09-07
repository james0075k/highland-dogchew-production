import { Router } from 'express';
import {
  createReview,
  getAllReviews,
  getProductReviews,
  getReviewStats,
  getReviewById,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { reviewLimiter } from '../middlewares/rateLimit/rateLimiters.js';

const ReviewRoute = Router();

// Both admin roles moderate. Listing every review — including pending, rejected
// and the reviewer's email — is an admin view, not a public one.
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')];

// Public. Order matters: the literal paths must stay above '/:tourId', or it
// swallows them as a tour id.
ReviewRoute.post('/', reviewLimiter, createReview);
ReviewRoute.get('/product/:productId', getProductReviews);
ReviewRoute.get('/stats', getReviewStats);
ReviewRoute.get('/:tourId', getReviewById);

// Admin only
ReviewRoute.get('/',       ...adminOnly, getAllReviews);
ReviewRoute.put('/:id',    ...adminOnly, updateReview);
ReviewRoute.delete('/:id', ...adminOnly, deleteReview);

export default ReviewRoute;
