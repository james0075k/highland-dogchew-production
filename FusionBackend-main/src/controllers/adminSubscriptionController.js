/**
 * adminSubscriptionController.js
 *
 * Auth-protected admin endpoints for viewing and managing subscriptions.
 */

import SubscriptionModel from '../models/subscriptionModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import sendEmail from '../utils/sendEmail.js';
import {
  subscriptionCancelledCustomerEmailHtml,
  subscriptionCancelledAdminEmailHtml,
  subscriptionPausedEmailHtml,
  subscriptionResumedEmailHtml,
} from '../utils/emailTemplates.js';

// ─── GET /api/admin/subscriptions/stats ──────────────────────────────────────
export const getSubscriptionStats = async (req, res, next) => {
  try {
    const [total, active, paused, payment_failed, cancelled] = await Promise.all([
      SubscriptionModel.countDocuments(),
      SubscriptionModel.countDocuments({ status: 'active' }),
      SubscriptionModel.countDocuments({ status: 'paused' }),
      SubscriptionModel.countDocuments({ status: 'payment_failed' }),
      SubscriptionModel.countDocuments({ status: 'cancelled' }),
    ]);

    // Monthly recurring revenue: sum of (unitPrice * quantity) for all active subs
    const mrrResult = await SubscriptionModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, mrr: { $sum: { $multiply: ['$unitPrice', '$quantity'] } } } },
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

// ─── GET /api/admin/subscriptions ────────────────────────────────────────────
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      const re = new RegExp(search.trim(), 'i');
      filter.$or = [
        { email: re },
        { productName: re },
        { subscriptionId: re },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [subscriptions, total] = await Promise.all([
      SubscriptionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-billingHistory -shippingAddress')
        .lean(),
      SubscriptionModel.countDocuments(filter),
    ]);

    return handleSuccess(res, 200, 'Subscriptions fetched', {
      subscriptions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/subscriptions/:id ────────────────────────────────────────
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

// ─── PATCH /api/admin/subscriptions/:id/status ───────────────────────────────
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
          subject: `Your Highland Yak Chew subscription has been cancelled – ${sub.subscriptionId}`,
          html: subscriptionCancelledCustomerEmailHtml(sub),
        }).catch((err) => console.error('[admin] Cancel customer email failed:', err.message));

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          sendEmail({
            to: adminEmail,
            subject: `Subscription Cancelled – ${sub.subscriptionId}`,
            html: subscriptionCancelledAdminEmailHtml(sub),
          }).catch((err) => console.error('[admin] Cancel admin email failed:', err.message));
        }
      } else if (status === 'paused') {
        sendEmail({
          to: sub.email,
          subject: `Your Highland Yak Chew subscription has been paused – ${sub.subscriptionId}`,
          html: subscriptionPausedEmailHtml(sub),
        }).catch((err) => console.error('[admin] Pause email failed:', err.message));
      } else if (status === 'active') {
        sendEmail({
          to: sub.email,
          subject: `Your Highland Yak Chew subscription has been resumed – ${sub.subscriptionId}`,
          html: subscriptionResumedEmailHtml(sub),
        }).catch((err) => console.error('[admin] Resume email failed:', err.message));
      }
    }

    return handleSuccess(res, 200, 'Subscription status updated', { subscription: sub });
  } catch (err) {
    next(err);
  }
};
