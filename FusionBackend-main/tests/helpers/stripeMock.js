/**
 * In-memory Stripe SDK stand-in.
 *
 * Avoids the docker-based stripe-mock so the suite runs anywhere. Replays the
 * narrow surface our code actually touches: paymentIntents create/retrieve/update,
 * promotionCodes retrieve, webhooks.constructEvent, customers, paymentMethods.
 *
 * Tests can read/poke `stripeMockState` to assert what the SDK was asked to do.
 */
import { vi } from 'vitest';

export const stripeMockState = {
  paymentIntents: new Map(),
  customers: new Map(),
  paymentMethods: new Map(),
  promotionCodes: new Map(),
  webhookSignatureChecker: () => true,
  nextEvent: null,
};

export function resetStripeMock() {
  stripeMockState.paymentIntents.clear();
  stripeMockState.customers.clear();
  stripeMockState.paymentMethods.clear();
  stripeMockState.promotionCodes.clear();
  stripeMockState.webhookSignatureChecker = () => true;
  stripeMockState.nextEvent = null;
}

let _idCounter = 0;
const newId = (prefix) => `${prefix}_test_${++_idCounter}_${Date.now()}`;

const fakeStripe = {
  paymentIntents: {
    create: vi.fn(async (params) => {
      const pi = {
        id: newId('pi'),
        client_secret: `${newId('pi')}_secret_${newId('cs')}`,
        amount: params.amount,
        amount_received: 0,
        currency: params.currency,
        status: 'requires_payment_method',
        metadata: { ...(params.metadata || {}) },
        setup_future_usage: params.setup_future_usage || null,
      };
      stripeMockState.paymentIntents.set(pi.id, pi);
      return pi;
    }),
    retrieve: vi.fn(async (id) => {
      const pi = stripeMockState.paymentIntents.get(id);
      if (!pi) {
        const err = new Error(`No such payment_intent: ${id}`);
        err.type = 'StripeInvalidRequestError';
        throw err;
      }
      return pi;
    }),
    update: vi.fn(async (id, params) => {
      const pi = stripeMockState.paymentIntents.get(id);
      if (!pi) throw new Error(`No such payment_intent: ${id}`);
      Object.assign(pi.metadata, params.metadata || {});
      if (params.receipt_email) pi.receipt_email = params.receipt_email;
      return pi;
    }),
    // Insertion-ordered page, mirroring Stripe's cursor semantics closely enough
    // for the reconciliation sweep (starting_after + has_more).
    list: vi.fn(async ({ limit = 100, starting_after: startingAfter } = {}) => {
      const all = [...stripeMockState.paymentIntents.values()];
      const from = startingAfter ? all.findIndex((p) => p.id === startingAfter) + 1 : 0;
      const page = all.slice(from, from + limit);
      return { data: page, has_more: from + page.length < all.length };
    }),
  },
  promotionCodes: {
    retrieve: vi.fn(async (id) => {
      const code = stripeMockState.promotionCodes.get(id);
      if (!code) throw Object.assign(new Error('not found'), { type: 'StripeInvalidRequestError' });
      return code;
    }),
  },
  customers: {
    create: vi.fn(async (params) => {
      const c = { id: newId('cus'), ...params };
      stripeMockState.customers.set(c.id, c);
      return c;
    }),
    update: vi.fn(async (id, params) => {
      const c = stripeMockState.customers.get(id);
      if (!c) throw new Error(`No such customer: ${id}`);
      Object.assign(c, params);
      return c;
    }),
    del: vi.fn(async (id) => {
      stripeMockState.customers.delete(id);
      return { id, deleted: true };
    }),
  },
  paymentMethods: {
    attach: vi.fn(async (id, params) => {
      const pm = { id, customer: params.customer };
      stripeMockState.paymentMethods.set(id, pm);
      return pm;
    }),
  },
  webhooks: {
    constructEvent: vi.fn((_payload, _sig, _secret) => {
      if (!stripeMockState.webhookSignatureChecker()) {
        throw new Error('No signatures found matching the expected signature for payload.');
      }
      if (!stripeMockState.nextEvent) {
        throw new Error('No event configured — set stripeMockState.nextEvent before posting to /webhook');
      }
      return stripeMockState.nextEvent;
    }),
  },
};

// Mock the centralized Stripe accessor used everywhere in the app.
// vi.mock with a factory hoists to the top of every test file that imports this module.
vi.mock('../../src/config/stripe.js', () => ({
  getStripe: () => fakeStripe,
}));

export { fakeStripe };
