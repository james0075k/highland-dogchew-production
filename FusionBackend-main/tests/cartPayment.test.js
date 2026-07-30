import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import './helpers/stripeMock.js';
import { resetStripeMock, stripeMockState } from './helpers/stripeMock.js';
import { buildApp } from './helpers/buildApp.js';
import { createProduct } from './helpers/factories.js';

const app = buildApp();

beforeEach(() => resetStripeMock());

describe('POST /api/cart-payments/validate', () => {
  it('calculates totals server-side and ignores client price', async () => {
    const product = await createProduct({ price: 10 });

    const res = await request(app)
      .post('/api/cart-payments/validate')
      .send({
        items: [{ productId: product._id.toString(), size: 'Default', quantity: 2, unitPrice: 999 }],
      });

    expect(res.status).toBe(200);
    // 2 * 10 = 20 subtotal
    expect(res.body.data.subtotal).toBe(20);
    // VAT is baked into catalogue prices, so TAX_RATE is 0 — not added again here
    expect(res.body.data.totalTax).toBe(0);
    expect(res.body.data.totalDelivery).toBe(1.99);
    expect(res.body.data.grandTotal).toBe(21.99);
  });

  it('rejects an item whose product was deleted', async () => {
    const res = await request(app)
      .post('/api/cart-payments/validate')
      .send({
        items: [{ productId: '507f1f77bcf86cd799439011', size: 'Default', quantity: 1 }],
      });
    expect(res.status).toBe(404);
  });

  it('rejects when requested quantity exceeds tracked stock', async () => {
    const product = await createProduct({
      price: 10, trackStock: true, stockQuantity: 3,
    });
    const res = await request(app)
      .post('/api/cart-payments/validate')
      .send({
        items: [{ productId: product._id.toString(), size: 'Default', quantity: 10 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Insufficient stock/);
  });

  it('applies subscription discount server-side', async () => {
    const product = await createProduct({
      price: 10,
      subscriptionSettings: { isEnabled: true, discountPercentage: 20 },
    });
    const res = await request(app)
      .post('/api/cart-payments/validate')
      .send({
        items: [{
          productId: product._id.toString(),
          size: 'Default',
          quantity: 1,
          isSubscription: true,
          subscriptionInterval: 'weekly:4',
        }],
      });
    expect(res.status).toBe(200);
    // 10 * 0.8 = 8 subtotal
    expect(res.body.data.subtotal).toBe(8);
  });
});

describe('POST /api/cart-payments/create-payment-intent', () => {
  it('creates a Stripe PI with the correct amount and returns updateToken', async () => {
    const product = await createProduct({ price: 10 });

    const res = await request(app)
      .post('/api/cart-payments/create-payment-intent')
      .send({
        items: [{ productId: product._id.toString(), size: 'Default', quantity: 1 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.paymentIntentId).toMatch(/^pi_test_/);
    expect(res.body.data.updateToken).toMatch(/^[a-f0-9]{48}$/);
    // 10 (VAT-inclusive) + 1.99 delivery = 11.99 → 1199 pence
    const pi = stripeMockState.paymentIntents.get(res.body.data.paymentIntentId);
    expect(pi.amount).toBe(1199);
    expect(pi.metadata.type).toBe('product-purchase');
    expect(pi.metadata.update_token).toBe(res.body.data.updateToken);
  });

  it('sets setup_future_usage=off_session when cart contains a subscription', async () => {
    const product = await createProduct({
      price: 10,
      subscriptionSettings: { isEnabled: true, discountPercentage: 10 },
    });
    const res = await request(app)
      .post('/api/cart-payments/create-payment-intent')
      .send({
        items: [{
          productId: product._id.toString(),
          size: 'Default',
          quantity: 1,
          isSubscription: true,
          subscriptionInterval: 'weekly:4',
        }],
      });
    expect(res.status).toBe(200);
    const pi = stripeMockState.paymentIntents.get(res.body.data.paymentIntentId);
    expect(pi.setup_future_usage).toBe('off_session');
    expect(pi.metadata.hasSubscription).toBe('true');
  });

  it('chunks the items metadata across multiple keys when the JSON is long', async () => {
    const product = await createProduct({
      price: 10,
      name: 'X'.repeat(100), // pad name so each item line is large
    });
    const items = Array.from({ length: 10 }, () => ({
      productId: product._id.toString(),
      size: 'Default',
      quantity: 1,
    }));
    const res = await request(app)
      .post('/api/cart-payments/create-payment-intent')
      .send({ items });
    expect(res.status).toBe(200);
    const pi = stripeMockState.paymentIntents.get(res.body.data.paymentIntentId);
    const chunkCount = parseInt(pi.metadata.items_n, 10);
    expect(chunkCount).toBeGreaterThanOrEqual(1);
    // Reassembly must be valid JSON
    let reassembled = '';
    for (let i = 0; i < chunkCount; i++) reassembled += pi.metadata[`items_${i}`];
    expect(() => JSON.parse(reassembled)).not.toThrow();
  });
});

describe('POST /api/cart-payments/update-meta', () => {
  async function createPI() {
    const product = await createProduct({ price: 10 });
    const res = await request(app)
      .post('/api/cart-payments/create-payment-intent')
      .send({ items: [{ productId: product._id.toString(), size: 'Default', quantity: 1 }] });
    return res.body.data; // { paymentIntentId, updateToken, ... }
  }

  it('accepts a correct token and writes customer/shipping to PI metadata', async () => {
    const { paymentIntentId, updateToken } = await createPI();

    const res = await request(app)
      .post('/api/cart-payments/update-meta')
      .send({
        paymentIntentId,
        updateToken,
        customer: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '555' },
        shipping: { address: '1 St', city: 'London', postcode: 'E1' },
      });

    expect(res.status).toBe(200);
    const pi = stripeMockState.paymentIntents.get(paymentIntentId);
    expect(pi.metadata.c_email).toBe('jane@example.com');
    expect(pi.metadata.s_city).toBe('London');
  });

  it('rejects a wrong update token', async () => {
    const { paymentIntentId } = await createPI();
    const res = await request(app)
      .post('/api/cart-payments/update-meta')
      .send({
        paymentIntentId,
        updateToken: 'a'.repeat(48),
        customer: { firstName: 'A', lastName: 'B', email: 'a@b.c' },
        shipping: { address: '1', city: 'L', postcode: 'E1' },
      });
    expect(res.status).toBe(403);
  });

  it('rejects a token of the wrong length without leaking timing', async () => {
    const { paymentIntentId } = await createPI();
    const res = await request(app)
      .post('/api/cart-payments/update-meta')
      .send({
        paymentIntentId,
        updateToken: 'short',
        customer: { firstName: 'A', lastName: 'B', email: 'a@b.c' },
        shipping: { address: '1', city: 'L', postcode: 'E1' },
      });
    expect(res.status).toBe(403);
  });
});
