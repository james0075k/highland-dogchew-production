import ReviewModel from '../models/reviewModel.js';
import ProductModel from '../models/productModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import logger from '../utils/logger.js';

const log = logger.child({ component: 'reviewController' });

// Reviewers give us their email so we can contact them about the review — it is
// never part of what the public sees next to their comment.
const PUBLIC_PROJECTION = '-guestInfo.email';

/**
 * Recomputes a product's headline rating from its approved reviews.
 *
 * product.rating / product.reviews are what the product card, the product page
 * header and the storefront JSON-LD all read. They started as fields an admin
 * typed by hand, so they could disagree with the actual reviews on the page —
 * a product showed an empty star row while carrying a real five-star review.
 * Recomputing here makes the reviews the single source of truth.
 *
 * Called after any change to a review's published state. Deliberately not
 * throwing: moderation must still succeed even if this write fails, and the
 * next moderation action recomputes it anyway.
 */
export async function syncProductRating(productId) {
  if (!productId) return;

  try {
    const [agg] = await ReviewModel.aggregate([
      { $match: { product: productId, status: 'approved', isDeleted: { $ne: true } } },
      { $group: { _id: null, count: { $sum: 1 }, sum: { $sum: '$rating' } } },
    ]);

    const count = agg?.count ?? 0;
    await ProductModel.findByIdAndUpdate(productId, {
      reviews: count,
      rating: count ? +(agg.sum / count).toFixed(1) : 0,
    });
  } catch (err) {
    log.error({ err, productId: String(productId) }, 'Failed to sync product rating');
  }
}

// CREATE review (public)
export const createReview = async (req, res, next) => {
  try {
    // Whitelist explicitly. Spreading req.body let a client send
    // status:'approved' and publish straight to the live site, and set
    // isDeleted to hide a review from moderation entirely.
    const { product, tour, guestInfo, rating, comment } = req.body;

    const review = await ReviewModel.create({
      product: product || null,
      tour: tour || null,
      guestInfo: {
        name: guestInfo?.name,
        email: guestInfo?.email || '',
      },
      rating,
      comment: comment || '',
      status: 'pending',
    });

    return handleSuccess(res, 201, 'Review submitted successfully. It will appear after approval.', review);
  } catch (err) {
    return next(handleError(400, `Failed to submit review: ${err.message}`));
  }
};

// GET all reviews (admin — all statuses)
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
    })
      .select(PUBLIC_PROJECTION)
      .sort({ createdAt: -1 });

    return handleSuccess(res, 200, 'Product reviews fetched', reviews);
  } catch (err) {
    return next(handleError(500, `Failed to fetch reviews: ${err.message}`));
  }
};

// GET aggregate rating stats (public)
// Feeds the JSON-LD aggregateRating on the storefront, which used to be
// hardcoded. Only approved reviews count, so the published numbers match what a
// visitor can actually read on the page.
export const getReviewStats = async (req, res, next) => {
  try {
    const rows = await ReviewModel.aggregate([
      { $match: { status: 'approved', isDeleted: { $ne: true }, product: { $ne: null } } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDoc',
        },
      },
      { $unwind: '$productDoc' },
      {
        $group: {
          _id: { product: '$product', productType: '$productDoc.productType' },
          count: { $sum: 1 },
          sum: { $sum: '$rating' },
        },
      },
    ]);

    // One decimal place is what Google shows and what the UI renders.
    const round1 = (sum, count) => +(sum / count).toFixed(1);

    const byProduct = {};
    const typeTotals = {};
    let siteCount = 0;
    let siteSum = 0;

    for (const row of rows) {
      byProduct[row._id.product.toString()] = {
        count: row.count,
        rating: round1(row.sum, row.count),
      };

      // The storefront JSON-LD markets three product lines, not individual
      // SKUs, so it needs the rating rolled up per productType.
      const type = row._id.productType;
      if (type) {
        typeTotals[type] ??= { count: 0, sum: 0 };
        typeTotals[type].count += row.count;
        typeTotals[type].sum += row.sum;
      }

      siteCount += row.count;
      siteSum += row.sum;
    }

    const byType = {};
    for (const [type, t] of Object.entries(typeTotals)) {
      byType[type] = { count: t.count, rating: round1(t.sum, t.count) };
    }

    return handleSuccess(res, 200, 'Review stats fetched', {
      byProduct,
      byType,
      site: {
        count: siteCount,
        rating: siteCount ? round1(siteSum, siteCount) : 0,
      },
    });
  } catch (err) {
    return next(handleError(500, `Failed to fetch review stats: ${err.message}`));
  }
};

// GET reviews by tour package ID (legacy, public)
export const getReviewById = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.find({
      tour: req.params.tourId,
      status: 'approved',
      isDeleted: { $ne: true },
    }).select(PUBLIC_PROJECTION);

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

    await syncProductRating(updatedReview.product);

    return handleSuccess(res, 200, 'Review updated', updatedReview);
  } catch (err) {
    return next(handleError(400, `Failed to update review: ${err.message}`));
  }
};

// DELETE review (admin — soft delete)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!review) return next(handleError(404, 'Review not found'));

    await syncProductRating(review.product);

    return handleSuccess(res, 200, 'Review deleted');
  } catch (err) {
    return next(handleError(500, `Failed to delete review: ${err.message}`));
  }
};
