/**
 * createSubscriptionsFromPI.js — Shared utility
 *
 * Creates subscription records from a confirmed PaymentIntent.
 * Used by both the Stripe webhook and the sync endpoint so that
 * subscriptions are always created regardless of which path runs first.
 *
 * Partial-failure protection:
 *   Stripe Customer setup (create → attach PM → set default) happens before
 *   any DB write.  If we created a NEW customer but every subsequent DB write
 *   fails, we attempt to delete the orphaned Stripe Customer so it does not
 *   accumulate billing metadata with no matching subscription record.
 *   If the Stripe cleanup also fails, the customer ID is logged prominently
 *   for manual recovery via the Stripe Dashboard.
 */

import { randomBytes } from 'crypto';
import { getStripe } from '../config/stripe.js';
import SubscriptionModel from '../models/subscriptionModel.js';
import { safeParse, unchunkFromMeta } from './createOrderFromPI.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIntervalWeeks(label) {
  if (!label) return 4; // fallback: monthly
  const lower = label.toLowerCase();
  const match = lower.match(/(\d+)\s*week/);
  if (match) return parseInt(match[1], 10);
  if (lower.includes('month')) return 4;
  if (lower.includes('fortnight') || lower.includes('2 week')) return 2;
  if (lower.includes('week')) return 1;
  return 4;
}

function addWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

// M-1 fix: use crypto.randomBytes instead of Math.random
function generateSubId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `SUB-${date}-${rand}`;
}

// ─── Create subscriptions from a confirmed PaymentIntent ─────────────────────

export async function createSubscriptionsFromPI(pi, order) {
  const meta = pi.metadata || {};

  if (meta.hasSubscription !== 'true') return;
  if (!pi.payment_method) {
    console.warn('[sub] No payment_method on PI — cannot create subscriptions');
    return;
  }

  // H-4 fix: reassemble subscription items from chunked metadata (prefix "si")
  const subItems = safeParse(unchunkFromMeta(meta, 'si'), []);
  if (!subItems.length) {
    console.warn('[sub] hasSubscription=true but subscriptionItems is empty');
    return;
  }

  const email = (meta.c_email || '').toLowerCase();

  // ── Resolve or create Stripe Customer ───────────────────────────────────────
  //
  // customerWasNewlyCreated tracks whether WE created the customer in this call.
  // Only a newly-created customer should be cleaned up on total DB failure —
  // an existing/reused customer belongs to prior subscription records.
  //
  let stripeCustomerId;
  let customerWasNewlyCreated = false;

  try {
    // M-3 fix: resolve via our own DB first to avoid cross-account email collisions
    const existingSubDoc = await SubscriptionModel.findOne({
      email,
      stripeCustomerId: { $exists: true, $ne: '' },
    }).select('stripeCustomerId').lean();

    if (existingSubDoc?.stripeCustomerId) {
      stripeCustomerId = existingSubDoc.stripeCustomerId;
      console.log(`[sub] Reusing existing Stripe Customer ${stripeCustomerId} for ${email}`);
    } else {
      const customer = await getStripe().customers.create({
        email,
        name: `${meta.c_firstName || ''} ${meta.c_lastName || ''}`.trim() || undefined,
        phone: meta.c_phone || undefined,
      });
      stripeCustomerId = customer.id;
      customerWasNewlyCreated = true;
      console.log(`[sub] Created new Stripe Customer ${stripeCustomerId} for ${email}`);
    }

    // Attach the payment method to the customer (idempotent if already attached)
    await getStripe().paymentMethods.attach(pi.payment_method, { customer: stripeCustomerId })
      .catch((err) => {
        if (!err.message?.includes('already been attached')) throw err;
      });

    // Set as default for future off-session invoices
    await getStripe().customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: pi.payment_method },
    });
  } catch (err) {
    console.error('[sub] Stripe Customer setup failed:', err.message);
    return; // Cannot proceed without a valid customer
  }

  // ── Create a SubscriptionModel document per subscription line item ──────────
  //
  // anyDbWriteSucceeded — true as soon as one SubscriptionModel.create() or
  // findOne() returns an existing doc.  Used to decide whether to attempt
  // Stripe Customer cleanup on total failure.
  //
  const addr = order.shippingAddress || {};
  let anyDbWriteSucceeded = false;

  for (const item of subItems) {
    const intervalWeeks   = parseIntervalWeeks(item.subscriptionInterval);
    const nextBillingDate = addWeeks(new Date(), intervalWeeks);

    try {
      // Idempotency: skip if this PI + product already has a subscription
      const existingDoc = await SubscriptionModel.findOne({
        'billingHistory.paymentIntentId': pi.id,
        product: item.productId || undefined,
        productName: item.name,
      });
      if (existingDoc) {
        console.log(`[sub] ⏭️  Subscription already exists for ${item.name} — skipped`);
        anyDbWriteSucceeded = true; // existing doc counts — customer is legitimately needed
        continue;
      }

      const sub = await SubscriptionModel.create({
        subscriptionId:   generateSubId(),
        email,
        stripeCustomerId,
        paymentMethodId:  pi.payment_method,
        product:          item.productId || undefined,
        productName:      item.name,
        productImage:     item.image || '',
        productSlug:      item.slug  || '',
        size:             item.size  || 'Default',
        quantity:         Number(item.quantity) || 1,
        unitPrice:        Number(item.unitPrice) || 0,
        intervalLabel:    item.subscriptionInterval || 'Every 4 weeks',
        intervalWeeks,
        status:           'active',
        nextBillingDate,
        firstOrderId:     order._id,
        orders:           [order._id],
        billingHistory: [{
          date:            new Date(),
          amount:          +(Number(item.unitPrice) * Number(item.quantity)).toFixed(2),
          status:          'success',
          orderId:         order._id,
          paymentIntentId: pi.id,
        }],
        shippingAddress: {
          fullName:     addr.fullName     || `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
          firstName:    addr.firstName    || '',
          lastName:     addr.lastName     || '',
          email:        addr.email        || email,
          phone:        addr.phone        || meta.c_phone || '',
          addressLine1: addr.addressLine1 || '',
          addressLine2: addr.addressLine2 || '',
          city:         addr.city         || '',
          county:       addr.county       || '',
          postcode:     addr.postcode     || '',
          country:      addr.country      || 'United Kingdom',
        },
      });

      anyDbWriteSucceeded = true;
      console.log(`[sub] ✅ Subscription ${sub.subscriptionId} created for ${item.name}`);
    } catch (err) {
      console.error(`[sub] ❌ Failed to create subscription for ${item.name}:`, err.message);
      // Continue with remaining items — partial success is better than total abort
    }
  }

  // ── Orphaned Stripe Customer cleanup ─────────────────────────────────────────
  //
  // Only runs when:
  //   1. We created a NEW customer (not reused) in this call, AND
  //   2. Every single DB write attempt failed
  //
  // If at least one subscription doc was written (or already existed), the customer
  // is legitimately needed for future billing — do NOT delete it.
  //
  if (customerWasNewlyCreated && !anyDbWriteSucceeded) {
    console.error(
      `[sub] ⚠️  All DB writes failed after creating Stripe Customer ${stripeCustomerId} — attempting cleanup`
    );
    try {
      await getStripe().customers.del(stripeCustomerId);
      console.log(`[sub] 🗑️  Orphaned Stripe Customer ${stripeCustomerId} deleted successfully`);
    } catch (cleanupErr) {
      // Manual intervention required — this customer has NO subscription records in our DB
      console.error(
        `[sub] CRITICAL: Could not delete orphaned Stripe Customer ${stripeCustomerId}.`,
        `Manual deletion required: https://dashboard.stripe.com/customers/${stripeCustomerId}`,
        cleanupErr.message
      );
    }
  }
}
