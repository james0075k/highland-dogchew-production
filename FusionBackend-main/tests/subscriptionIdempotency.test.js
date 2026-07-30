/**
 * Regression tests for the duplicate-subscription race.
 *
 * The Stripe webhook (payment_intent.succeeded) and POST /api/orders/sync both
 * call createSubscriptionsFromPI for the same payment, milliseconds apart. Before
 * the fix, both passed the "does it already exist?" read and both inserted — so
 * the customer had two subscription records and was charged twice on every
 * renewal, forever.
 *
 * These tests assert all three defence layers: single-flight, origin-key lookup,
 * and the unique index.
 */

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import './helpers/stripeMock.js';
import { resetStripeMock, stripeMockState } from './helpers/stripeMock.js';
import { createProduct } from './helpers/factories.js';
import { createSubscriptionsFromPI } from '../src/utils/createSubscriptionsFromPI.js';
import SubscriptionModel from '../src/models/subscriptionModel.js';
import OrderModel from '../src/models/orderModel.js';

beforeAll(async () => {
  // afterEach only clears documents, so building the indexes once is enough.
  await SubscriptionModel.createIndexes();
});

beforeEach(() => resetStripeMock());

// Builds the (PI, order) pair the util expects, mirroring what
// cartPaymentController writes into PI metadata for a subscription cart.
async function makeSubscriptionPayment() {
  const product = await createProduct({ price: 10 });

  const item = {
    productId:            product._id.toString(),
    name:                 product.name,
    image:                'p.jpg',
    slug:                 'p',
    size:                 'Small 30-40g',
    quantity:             1,
    unitPrice:            9,
    isSubscription:       true,
    subscriptionInterval: 'Every 4 weeks',
  };

  const pi = {
    id:             `pi_test_${Date.now()}`,
    status:         'succeeded',
    amount_received: 1099,
    payment_method: 'pm_test_123',
    metadata: {
      type:            'product-purchase',
      hasSubscription: 'true',
      c_email:         'buyer@test.local',
      c_firstName:     'Ada',
      c_lastName:      'Lovelace',
      si_n:            '1',
      si_0:            JSON.stringify([item]),
    },
  };

  const order = await OrderModel.create({
    items: [{ name: item.name, size: item.size, quantity: 1, unitPrice: 9 }],
    shippingAddress: {
      fullName: 'Ada Lovelace', firstName: 'Ada', lastName: 'Lovelace',
      email: 'buyer@test.local', addressLine1: '1 Test St',
      city: 'London', postcode: 'SW1A 1AA', country: 'United Kingdom',
    },
    subtotal:        9,
    grandTotal:      10.99,
    paymentIntentId: pi.id,
    paymentStatus:   'paid',
    orderStatus:     'confirmed',
  });

  return { pi, order, item };
}

describe('createSubscriptionsFromPI idempotency', () => {
  it('creates exactly one subscription when the webhook and sync run concurrently', async () => {
    const { pi, order } = await makeSubscriptionPayment();

    // The real race: both callers fire without awaiting each other.
    await Promise.all([
      createSubscriptionsFromPI(pi, order),
      createSubscriptionsFromPI(pi, order),
    ]);

    const subs = await SubscriptionModel.find({ originPaymentIntentId: pi.id });
    expect(subs).toHaveLength(1);
    expect(subs[0].originItemKey).toContain('::Small 30-40g');

    // And only one Stripe Customer — customers.create sits inside the same window.
    expect(stripeMockState.customers.size).toBe(1);
  });

  it('is a no-op when called again after the subscription exists', async () => {
    const { pi, order } = await makeSubscriptionPayment();

    await createSubscriptionsFromPI(pi, order);
    await createSubscriptionsFromPI(pi, order);
    await createSubscriptionsFromPI(pi, order);

    expect(await SubscriptionModel.countDocuments({ originPaymentIntentId: pi.id })).toBe(1);
  });

  it('creates one subscription per distinct cart line, not per call', async () => {
    const { pi, order, item } = await makeSubscriptionPayment();

    // Same product, two different sizes — two legitimate subscriptions.
    const second = { ...item, size: 'Large 60-70g', unitPrice: 15 };
    pi.metadata.si_0 = JSON.stringify([item, second]);

    await Promise.all([
      createSubscriptionsFromPI(pi, order),
      createSubscriptionsFromPI(pi, order),
    ]);

    const subs = await SubscriptionModel.find({ originPaymentIntentId: pi.id });
    expect(subs).toHaveLength(2);
    expect(subs.map((s) => s.size).sort()).toEqual(['Large 60-70g', 'Small 30-40g']);
  });

  it('has a unique index that rejects a duplicate origin key at the database level', async () => {
    const { pi, order } = await makeSubscriptionPayment();
    await createSubscriptionsFromPI(pi, order);

    const existing = await SubscriptionModel.findOne({ originPaymentIntentId: pi.id }).lean();

    // Simulate a cross-process insert that bypassed every application guard.
    const duplicate = {
      ...existing,
      _id:            undefined,
      subscriptionId: 'SUB-DUPLICATE-TEST',
    };
    delete duplicate._id;

    await expect(SubscriptionModel.create(duplicate)).rejects.toMatchObject({ code: 11000 });
    expect(await SubscriptionModel.countDocuments({ originPaymentIntentId: pi.id })).toBe(1);
  });
});
