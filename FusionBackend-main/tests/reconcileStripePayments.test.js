/**
 * Tests for the payment reconciliation sweep — the safety net that runs when
 * BOTH normal order-creation paths miss a payment (webhook not delivering and
 * the customer closed the tab before the receipt loaded).
 *
 * Its whole value is being correct in a situation nobody is watching, so the
 * important assertions are: it rescues what's missing, and it leaves everything
 * else completely alone.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import './helpers/stripeMock.js';
import { resetStripeMock, stripeMockState } from './helpers/stripeMock.js';
import { createProduct } from './helpers/factories.js';
import { reconcileStripePayments } from '../src/utils/reconcileStripePayments.js';
import OrderModel from '../src/models/orderModel.js';

beforeEach(() => resetStripeMock());

// Registers a succeeded product-purchase PI with the Stripe mock, exactly as
// cartPaymentController would have created it.
async function seedSucceededPayment(overrides = {}) {
  const product = await createProduct({ price: 10 });
  const lineItems = [{
    productId: product._id.toString(),
    name:      product.name,
    size:      'Default',
    quantity:  1,
    unitPrice: 10,
    lineTotal: 10,
  }];

  const pi = {
    id:              `pi_recon_${Math.random().toString(36).slice(2, 10)}`,
    status:          'succeeded',
    amount:          1199,
    amount_received: 1199,
    payment_method:  'pm_test_recon',
    metadata: {
      type:          'product-purchase',
      c_firstName:   'Ada',
      c_lastName:    'Lovelace',
      c_email:       'buyer@test.local',
      s_line1:       '1 Test St',
      s_city:        'London',
      s_postcode:    'SW1A 1AA',
      s_country:     'United Kingdom',
      subtotal:      '10',
      totalTax:      '0',
      totalDelivery: '1.99',
      discount:      '0',
      grandTotal:    '11.99',
      items_n:       '1',
      items_0:       JSON.stringify(lineItems),
      ...overrides.metadata,
    },
    ...overrides.pi,
  };

  stripeMockState.paymentIntents.set(pi.id, pi);
  return { pi, product };
}

describe('reconcileStripePayments', () => {
  it('creates the order for a succeeded payment that has none', async () => {
    const { pi } = await seedSucceededPayment();

    const result = await reconcileStripePayments();

    expect(result.rescued).toHaveLength(1);
    expect(result.failed).toHaveLength(0);

    const order = await OrderModel.findOne({ paymentIntentId: pi.id });
    expect(order).not.toBeNull();
    expect(order.paymentStatus).toBe('paid');
    expect(order.grandTotal).toBe(11.99);
    expect(order.shippingAddress.email).toBe('buyer@test.local');
  });

  it('does nothing when the webhook already created the order', async () => {
    const { pi } = await seedSucceededPayment();
    await reconcileStripePayments();          // stands in for the webhook
    const before = await OrderModel.countDocuments();

    const result = await reconcileStripePayments();

    expect(result.rescued).toHaveLength(0);
    expect(await OrderModel.countDocuments()).toBe(before);
  });

  it('ignores payments that are not ours and payments that never succeeded', async () => {
    // Someone else's payment on the same Stripe account
    stripeMockState.paymentIntents.set('pi_other', {
      id: 'pi_other', status: 'succeeded', amount: 500, metadata: { type: 'something-else' },
    });
    // Our payment, abandoned at the card form
    stripeMockState.paymentIntents.set('pi_unpaid', {
      id: 'pi_unpaid', status: 'requires_payment_method', amount: 500,
      metadata: { type: 'product-purchase' },
    });

    const result = await reconcileStripePayments();

    expect(result.scanned).toBe(0);
    expect(result.rescued).toHaveLength(0);
    expect(await OrderModel.countDocuments()).toBe(0);
  });

  it('records a failure instead of throwing when one payment cannot be recovered', async () => {
    // Corrupt items metadata → buildOrderItems produces nothing and the order
    // insert fails validation. The sweep must survive and keep going.
    const { pi: broken } = await seedSucceededPayment({
      metadata: { items_n: '1', items_0: 'not-json', subtotal: 'not-a-number', grandTotal: 'nope' },
    });
    const { pi: healthy } = await seedSucceededPayment();

    const result = await reconcileStripePayments();

    expect(result.failed).toContain(broken.id);
    // The healthy payment still got its order — one bad record can't block the rest.
    expect(await OrderModel.findOne({ paymentIntentId: healthy.id })).not.toBeNull();
  });

  it('pages through more results than one Stripe page holds', async () => {
    for (let i = 0; i < 3; i++) await seedSucceededPayment();

    const result = await reconcileStripePayments();

    expect(result.scanned).toBe(3);
    expect(result.rescued).toHaveLength(3);
  });
});
