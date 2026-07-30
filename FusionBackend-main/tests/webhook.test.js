import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import './helpers/stripeMock.js';
import { resetStripeMock, stripeMockState } from './helpers/stripeMock.js';
import { buildApp } from './helpers/buildApp.js';
import { createProduct } from './helpers/factories.js';
import OrderModel from '../src/models/orderModel.js';

const app = buildApp();

beforeEach(() => resetStripeMock());

/**
 * Webhooks deliver via POST /api/webhook/stripe with a raw body.
 * We stage stripeMockState.nextEvent so constructEvent returns it.
 */
function postWebhook(event) {
  stripeMockState.nextEvent = event;
  return request(app)
    .post('/api/webhook/stripe')
    .set('Content-Type', 'application/json')
    .set('Stripe-Signature', 't=1,v1=fake')
    .send(Buffer.from(JSON.stringify(event)));
}

function piSucceededFor(product, overrides = {}) {
  const items = [{
    productId: product._id.toString(),
    name: product.name,
    size: 'Default',
    quantity: 1,
    unitPrice: 10,
  }];
  const itemsJson = JSON.stringify(items);
  return {
    id: 'evt_test_1',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_abc',
        amount_received: 1499,
        status: 'succeeded',
        metadata: {
          type: 'product-purchase',
          itemCount: '1',
          subtotal: '10',
          totalTax: '2',
          totalDelivery: '2.99',
          discount: '0',
          grandTotal: '14.99',
          items_n: '1',
          items_0: itemsJson,
          c_firstName: 'Jane',
          c_lastName: 'Doe',
          c_email: 'jane@example.com',
          s_line1: '1 St',
          s_city: 'London',
          s_postcode: 'E1',
          ...(overrides.metadata || {}),
        },
        ...overrides.object,
      },
    },
  };
}

describe('POST /api/webhook/stripe', () => {
  it('rejects events with a bad signature', async () => {
    stripeMockState.webhookSignatureChecker = () => false;
    stripeMockState.nextEvent = { type: 'payment_intent.succeeded' };
    const res = await request(app)
      .post('/api/webhook/stripe')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', 't=1,v1=evil')
      .send(Buffer.from('{}'));
    expect(res.status).toBe(400);
  });

  it('creates an order on payment_intent.succeeded', async () => {
    const product = await createProduct({ price: 10 });

    const res = await postWebhook(piSucceededFor(product));
    expect(res.status).toBe(200);

    const orders = await OrderModel.find({});
    expect(orders).toHaveLength(1);
    expect(orders[0].paymentIntentId).toBe('pi_test_abc');
    expect(orders[0].paymentStatus).toBe('paid');
    expect(orders[0].shippingAddress.email).toBe('jane@example.com');
    expect(orders[0].grandTotal).toBe(14.99);
  });

  it('is idempotent — replaying the same event does not duplicate the order', async () => {
    const product = await createProduct({ price: 10 });
    const evt = piSucceededFor(product);

    await postWebhook(evt);
    await postWebhook(evt);

    const orders = await OrderModel.find({});
    expect(orders).toHaveLength(1);
  });

  it('decrements stock when trackStock=true', async () => {
    const product = await createProduct({ price: 10, trackStock: true, stockQuantity: 5 });
    await postWebhook(piSucceededFor(product));

    const after = await (await import('../src/models/productModel.js')).default.findById(product._id);
    expect(after.stockQuantity).toBe(4);
  });

  it('marks the order backordered when stock has already run out', async () => {
    const product = await createProduct({ price: 10, trackStock: true, stockQuantity: 0 });
    await postWebhook(piSucceededFor(product));
    const order = await OrderModel.findOne({ paymentIntentId: 'pi_test_abc' });
    expect(order.orderStatus).toBe('backordered');
  });

  it('marks orderStatus=cancelled and paymentStatus=failed on payment_intent.canceled', async () => {
    const product = await createProduct({ price: 10 });
    await postWebhook(piSucceededFor(product));

    // Force the order back to pending so the cancel update can find it
    await OrderModel.updateOne({ paymentIntentId: 'pi_test_abc' }, { paymentStatus: 'pending' });

    await postWebhook({
      id: 'evt_cancel',
      type: 'payment_intent.canceled',
      data: { object: { id: 'pi_test_abc', metadata: { type: 'product-purchase' } } },
    });

    const order = await OrderModel.findOne({ paymentIntentId: 'pi_test_abc' });
    expect(order.orderStatus).toBe('cancelled');
    expect(order.paymentStatus).toBe('failed');
  });

  it('marks the order refunded on charge.refunded', async () => {
    const product = await createProduct({ price: 10 });
    await postWebhook(piSucceededFor(product));

    await postWebhook({
      id: 'evt_refund',
      type: 'charge.refunded',
      data: { object: { payment_intent: 'pi_test_abc' } },
    });

    const order = await OrderModel.findOne({ paymentIntentId: 'pi_test_abc' });
    expect(order.paymentStatus).toBe('refunded');
    expect(order.orderStatus).toBe('cancelled');
  });

  it('ignores events not tagged with metadata.type=product-purchase', async () => {
    await postWebhook({
      id: 'evt_other',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_other', metadata: { type: 'something-else' } } },
    });
    const orders = await OrderModel.find({});
    expect(orders).toHaveLength(0);
  });

  // Pay by Bank and similar settle after the customer leaves. The order must
  // still only be created on success — this event exists for visibility alone.
  it('acknowledges payment_intent.processing without creating an order', async () => {
    const res = await postWebhook({
      id: 'evt_processing',
      type: 'payment_intent.processing',
      data: {
        object: {
          id: 'pi_processing',
          amount: 578,
          payment_method_types: ['pay_by_bank'],
          metadata: {
            type: 'product-purchase',
            c_email: 'buyer@test.local',
            c_firstName: 'Ada',
            s_line1: '1 Test St',
            s_city: 'London',
            s_postcode: 'SW1A 1AA',
          },
        },
      },
    });

    expect(res.status).toBe(200);
    expect(await OrderModel.countDocuments()).toBe(0);
  });
});
