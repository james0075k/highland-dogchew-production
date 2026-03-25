/**
 * src/config/stripe.js — Centralised Stripe client
 *
 * Lazy-initialised so it works correctly with ESM + dotenv:
 * process.env.STRIPE_SECRET_KEY is read on first use, not at import time.
 *
 * API version is pinned so webhook event shapes never change silently
 * when Stripe releases a new API version.
 */

import Stripe from 'stripe';

let _stripe = null;

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('[stripe] STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    });
  }
  return _stripe;
}
