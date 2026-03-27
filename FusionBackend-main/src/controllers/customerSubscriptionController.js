/**
 * customerSubscriptionController.js
 *
 * Customer-facing subscription management (no admin JWT required).
 * Identity is verified by matching email + subscriptionId — the subscriptionId
 * is a 48-bit random hex string, making brute-force enumeration infeasible.
 *
 * Endpoints:
 *   POST   /api/customer/subscriptions/lookup
 *   GET    /api/customer/subscriptions/:subscriptionId/orders
 *   PATCH  /api/customer/subscriptions/:subscriptionId/cancel
 *   PATCH  /api/customer/subscriptions/:subscriptionId/pause
 *   PATCH  /api/customer/subscriptions/:subscriptionId/resume
 *   POST   /api/customer/subscriptions/:subscriptionId/setup-intent
 *   POST   /api/customer/subscriptions/:subscriptionId/update-payment
 */

import SubscriptionModel from '../models/subscriptionModel.js';
import OrderModel from '../models/orderModel.js';
import { getStripe } from '../config/stripe.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import sendEmail from '../utils/sendEmail.js';
import {
  subscriptionCancelledCustomerEmailHtml,
  subscriptionPausedEmailHtml,
  subscriptionResumedEmailHtml,
} from '../utils/emailTemplates.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strip Stripe internal IDs before sending to client
function sanitize(sub) {
  const s = sub.toObject ? sub.toObject() : { ...sub };
  delete s.stripeCustomerId;
  delete s.paymentMethodId;
  return s;
}

// Find a subscription that belongs to this email address
async function findOwned(subscriptionId, email) {
  return SubscriptionModel.findOne({
    subscriptionId,
    email: email.toLowerCase().trim(),
  });
}

// ─── POST /api/customer/subscriptions/lookup ──────────────────────────────────
// Returns all subscriptions for the given email address.
export const lookupSubscriptions = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'A valid email address is required'));
    }

    const subs = await SubscriptionModel.find({ email: email.toLowerCase().trim() })
      .select('-stripeCustomerId -paymentMethodId')
      .sort({ createdAt: -1 })
      .lean();

    return handleSuccess(res, 200, 'Subscriptions fetched', { subscriptions: subs });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/customer/subscriptions/:subscriptionId/orders ──────────────────
// Returns all orders linked to this subscription (email verified via query param).
export const getSubscriptionOrders = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'email query param is required'));
    }

    const sub = await findOwned(req.params.subscriptionId, email);
    if (!sub) return next(handleError(404, 'Subscription not found'));

    const orders = await OrderModel.find({ _id: { $in: sub.orders } })
      .select('orderNumber grandTotal orderStatus paymentStatus createdAt trackingNumber courier shippedAt')
      .sort({ createdAt: -1 })
      .lean();

    return handleSuccess(res, 200, 'Orders fetched', { orders });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/customer/subscriptions/:subscriptionId/cancel ────────────────
export const cancelSubscription = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'Email is required'));
    }

    const sub = await findOwned(req.params.subscriptionId, email);
    if (!sub) return next(handleError(404, 'Subscription not found'));
    if (sub.status === 'cancelled') return next(handleError(400, 'Subscription is already cancelled'));

    sub.status = 'cancelled';
    await sub.save();

    sendEmail({
      to: sub.email,
      subject: `Your Highland Yak Chew subscription has been cancelled – ${sub.subscriptionId}`,
      html: subscriptionCancelledCustomerEmailHtml(sub),
    }).catch((err) => console.error('[customer] Cancel email failed:', err.message));

    return handleSuccess(res, 200, 'Subscription cancelled', { subscription: sanitize(sub) });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/customer/subscriptions/:subscriptionId/pause ─────────────────
export const pauseSubscription = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'Email is required'));
    }

    const sub = await findOwned(req.params.subscriptionId, email);
    if (!sub) return next(handleError(404, 'Subscription not found'));
    if (sub.status !== 'active') {
      return next(handleError(400, 'Only active subscriptions can be paused'));
    }

    sub.status = 'paused';
    await sub.save();

    sendEmail({
      to: sub.email,
      subject: `Your Highland Yak Chew subscription has been paused – ${sub.subscriptionId}`,
      html: subscriptionPausedEmailHtml(sub),
    }).catch((err) => console.error('[customer] Pause email failed:', err.message));

    return handleSuccess(res, 200, 'Subscription paused', { subscription: sanitize(sub) });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/customer/subscriptions/:subscriptionId/resume ────────────────
export const resumeSubscription = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'Email is required'));
    }

    const sub = await findOwned(req.params.subscriptionId, email);
    if (!sub) return next(handleError(404, 'Subscription not found'));
    if (!['paused', 'payment_failed'].includes(sub.status)) {
      return next(handleError(400, 'Only paused or payment-failed subscriptions can be resumed'));
    }

    sub.status = 'active';
    sub.failureCount = 0;
    sub.failureReason = '';
    await sub.save();

    sendEmail({
      to: sub.email,
      subject: `Your Highland Yak Chew subscription has been resumed – ${sub.subscriptionId}`,
      html: subscriptionResumedEmailHtml(sub),
    }).catch((err) => console.error('[customer] Resume email failed:', err.message));

    return handleSuccess(res, 200, 'Subscription resumed', { subscription: sanitize(sub) });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/customer/subscriptions/:subscriptionId/setup-intent ───────────
// Creates a Stripe SetupIntent so the customer can update their saved card.
export const createSetupIntent = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'Email is required'));
    }

    const sub = await findOwned(req.params.subscriptionId, email);
    if (!sub) return next(handleError(404, 'Subscription not found'));
    if (sub.status === 'cancelled') {
      return next(handleError(400, 'Cannot update card for a cancelled subscription'));
    }

    const setupIntent = await getStripe().setupIntents.create({
      customer:             sub.stripeCustomerId,
      payment_method_types: ['card'],
      usage:                'off_session',
      metadata: {
        subscriptionId: sub.subscriptionId,
        email:          sub.email,
      },
    });

    return handleSuccess(res, 200, 'Setup intent created', {
      clientSecret: setupIntent.client_secret,
    });
  } catch (err) {
    if (err?.type?.startsWith('Stripe')) return next(handleError(402, err.message));
    next(err);
  }
};

// ─── POST /api/customer/subscriptions/:subscriptionId/update-payment ─────────
// Called after Stripe SetupIntent succeeds.
// Attaches the new payment method to the Stripe Customer + updates our DB.
// If the subscription was in payment_failed state, reactivates it.
export const updatePaymentMethod = async (req, res, next) => {
  try {
    const { email, paymentMethodId } = req.body;
    if (!email || !EMAIL_RE.test(String(email).trim())) {
      return next(handleError(400, 'email is required'));
    }
    if (!paymentMethodId || typeof paymentMethodId !== 'string') {
      return next(handleError(400, 'paymentMethodId is required'));
    }

    const sub = await findOwned(req.params.subscriptionId, email);
    if (!sub) return next(handleError(404, 'Subscription not found'));
    if (sub.status === 'cancelled') {
      return next(handleError(400, 'Cannot update card for a cancelled subscription'));
    }

    const stripe = getStripe();

    // Attach new card to Stripe Customer (idempotent if already attached)
    await stripe.paymentMethods.attach(paymentMethodId, { customer: sub.stripeCustomerId })
      .catch((err) => {
        if (!err.message?.includes('already been attached')) throw err;
      });

    // Set as the default payment method for future off-session charges
    await stripe.customers.update(sub.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Update subscription record — reactivate if previously failed
    sub.paymentMethodId = paymentMethodId;
    if (sub.status === 'payment_failed') {
      sub.status       = 'active';
      sub.failureCount = 0;
      sub.failureReason = '';
    }
    await sub.save();

    return handleSuccess(res, 200, 'Payment method updated successfully', { subscription: sanitize(sub) });
  } catch (err) {
    if (err?.type?.startsWith('Stripe')) return next(handleError(402, err.message));
    next(err);
  }
};
