import ReviewModel from '../models/reviewModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';

// CREATE review (public)
export const createReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.create(req.body);
    return handleSuccess(res, 201, 'Review submitted successfully. It will appear after approval.', review);
  } catch (err) {
    return next(handleError(400, `Failed to submit review: ${err.message}`));
  }
};

// GET all reviews (admin â€” all statuses)
export const getAllReviews = async (req, res, next) => {
  try {
    const { status, productId } = req.query;
    const filter = { isDeleted: { $ne: true } };
    if (status && status !== 'all') filter.status = status;
    if (productId) filter.product = productId;

    const reviews = await ReviewModel.find(filter)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });
    return handleSuccess(res, 200, 'All reviews fetched', reviews);
  } catch (err) {
    return next(handleError(500, `Failed to fetch reviews: ${err.message}`));
  }
};

// GET approved reviews for a product (public)
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewModel.find({
      product: productId,
      status: 'approved',
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    return handleSuccess(res, 200, 'Product reviews fetched', reviews);
  } catch (err) {
    return next(handleError(500, `Failed to fetch reviews: ${err.message}`));
  }
};

// GET reviews by tour package ID (legacy)
export const getReviewById = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.find({ tour: req.params.tourId, isDeleted: { $ne: true } });
    return handleSuccess(res, 200, 'Reviews for this tour fetched', reviews);
  } catch (err) {
    return next(handleError(500, `Failed to fetch reviews: ${err.message}`));
  }
};

// UPDATE review (admin)
export const updateReview = async (req, res, next) => {
  try {
    const updatedReview = await ReviewModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReview) return next(handleError(404, 'Review not found'));
    return handleSuccess(res, 200, 'Review updated', updatedReview);
  } catch (err) {
    return next(handleError(400, `Failed to update review: ${err.message}`));
  }
};

// DELETE review (admin â€” soft delete)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!review) return next(handleError(404, 'Review not found'));
    return handleSuccess(res, 200, 'Review deleted');
  } catch (err) {
    return next(handleError(500, `Failed to delete review: ${err.message}`));
  }
};
