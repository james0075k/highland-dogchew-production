/**
 * adminSubscriptionController.js
 *
 * Auth-protected admin endpoints for viewing and managing subscriptions.
 */

import SubscriptionModel from '../models/subscriptionModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import sendEmail from '../utils/sendEmail.js';
import {
  subscriptionCancelledCustomerEmailHtml,
  subscriptionCancelledAdminEmailHtml,
  subscriptionPausedEmailHtml,
  subscriptionResumedEmailHtml,
} from '../utils/emailTemplates.js';

// Escape regex special characters to prevent ReDoS attacks
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// â”€â”€â”€ GET /api/admin/subscriptions/stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getSubscriptionStats = async (req, res, next) => {
  try {
    const [total, active, paused, payment_failed, cancelled] = await Promise.all([
      SubscriptionModel.countDocuments(),
      SubscriptionModel.countDocuments({ status: 'active' }),
      SubscriptionModel.countDocuments({ status: 'paused' }),
      SubscriptionModel.countDocuments({ status: 'payment_failed' }),
      SubscriptionModel.countDocuments({ status: 'cancelled' }),
    ]);

    // MRR = sum of (unitPrice Ã— qty Ã— 1.20 VAT + Â£2.99 delivery) for all active subs
    const TAX_RATE = 0.20;
    const DELIVERY = 2.99;
    const mrrResult = await SubscriptionModel.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          mrr: {
            $sum: {
              $add: [
                { $multiply: [{ $multiply: ['$unitPrice', '$quantity'] }, 1 + TAX_RATE] },
                DELIVERY,
              ],
            },
          },
        },
      },
    ]);
    const mrr = mrrResult[0]?.mrr || 0;

    return handleSuccess(res, 200, 'Subscription stats', {
      total, active, paused, payment_failed, cancelled,
      mrr: +mrr.toFixed(2),
    });
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€ GET /api/admin/subscriptions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    // Validate and clamp page/limit to prevent undefined-behaviour with 0 or negative values
    const pageNum  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      // Escape special regex chars to prevent ReDoS
      const escaped = escapeRegex(search.trim());
      const re = new RegExp(escaped, 'i');
      filter.$or = [
        { email: re },
        { productName: re },
        { subscriptionId: re },
      ];
    }

    const skip = (pageNum - 1) * limitNum;
    const [subscriptions, total] = await Promise.all([
      SubscriptionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-billingHistory -shippingAddress')
        .lean(),
      SubscriptionModel.countDocuments(filter),
    ]);

    return handleSuccess(res, 200, 'Subscriptions fetched', {
      subscriptions,
      pagination: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€ GET /api/admin/subscriptions/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getSubscriptionById = async (req, res, next) => {
  try {
    const sub = await SubscriptionModel.findById(req.params.id)
      .populate('product', 'name slug image price')
      .populate('firstOrderId', 'orderNumber grandTotal createdAt')
      .lean();

    if (!sub) return next(handleError(404, 'Subscription not found'));
    return handleSuccess(res, 200, 'Subscription fetched', { subscription: sub });
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€ PATCH /api/admin/subscriptions/:id/status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'paused', 'payment_failed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return next(handleError(400, `status must be one of: ${allowed.join(', ')}`));
    }

    const sub = await SubscriptionModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!sub) return next(handleError(404, 'Subscription not found'));

    // Send notification email based on new status (fire-and-forget)
    if (sub.email) {
      if (status === 'cancelled') {
        sendEmail({
          to: sub.email,
          subject: `Your Highland Yak Chew subscription has been cancelled â€“ ${sub.subscriptionId}`,
          html: subscriptionCancelledCustomerEmailHtml(sub),
        }).catch((err) => console.error('[admin] Cancel customer email failed:', err.message));

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          sendEmail({
            to: adminEmail,
            subject: `Subscription Cancelled â€“ ${sub.subscriptionId}`,
            html: subscriptionCancelledAdminEmailHtml(sub),
          }).catch((err) => console.error('[admin] Cancel admin email failed:', err.message));
        }
      } else if (status === 'paused') {
        sendEmail({
          to: sub.email,
          subject: `Your Highland Yak Chew subscription has been paused â€“ ${sub.subscriptionId}`,
          html: subscriptionPausedEmailHtml(sub),
        }).catch((err) => console.error('[admin] Pause email failed:', err.message));
      } else if (status === 'active') {
        sendEmail({
          to: sub.email,
          subject: `Your Highland Yak Chew subscription has been resumed â€“ ${sub.subscriptionId}`,
          html: subscriptionResumedEmailHtml(sub),
        }).catch((err) => console.error('[admin] Resume email failed:', err.message));
      }
    }

    return handleSuccess(res, 200, 'Subscription status updated', { subscription: sub });
  } catch (err) {
    next(err);
  }
};
