/**
 * What the two receipt endpoints are allowed to expose.
 *
 * GET /api/orders/payment-intent/:id and POST /api/orders/sync both hand an
 * order to the browser, and they used to disagree: the GET stripped the phone
 * number, the POST returned the raw Mongo document. Which one the receipt got
 * depended on a race, so the same page sometimes leaked a phone number and
 * sometimes lost the customer's first name.
 *
 * Both now go through toCustomerOrder, and these tests pin that down.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import './helpers/stripeMock.js';
import { resetStripeMock, stripeMockState } from './helpers/stripeMock.js';
import { buildApp } from './helpers/buildApp.js';
import OrderModel from '../src/models/orderModel.js';

const app = buildApp();

beforeEach(() => resetStripeMock());

const SHIPPING = {
  fullName:     'Ada Lovelace',
  firstName:    'Ada',
  lastName:     'Lovelace',
  email:        'buyer@test.local',
  phone:        '07700 900123',
  addressLine1: '1 Test St',
  city:         'London',
  postcode:     'SW1A 1AA',
  country:      'United Kingdom',
};

async function seedOrder(paymentIntentId) {
  return OrderModel.create({
    items: [{ name: 'Blueberry dog chew', size: 'Small 30-40g', quantity: 1, unitPrice: 3.79 }],
    shippingAddress: SHIPPING,
    subtotal:      3.79,
    grandTotal:    5.78,
    paymentIntentId,
    paymentStatus: 'paid',
    orderStatus:   'confirmed',
    promoCode: {
      code: 'FREE', discountAmount: 0, customerIP: '203.0.113.9', raceLost: false,
    },
  });
}

describe('GET /api/orders/payment-intent/:id', () => {
  it('returns the receipt fields without the phone number', async () => {
    await seedOrder('pi_expose_get');

    const res = await request(app).get('/api/orders/payment-intent/pi_expose_get');

    expect(res.status).toBe(200);
    const addr = res.body.data.shippingAddress;
    expect(addr.phone).toBeUndefined();
    expect(addr.firstName).toBe('Ada');   // receipt greets by first name
    expect(addr.email).toBe('buyer@test.local');
    expect(addr.postcode).toBe('SW1A 1AA');
    // Promo audit trail is internal
    expect(res.body.data.promoCode.customerIP).toBeUndefined();
    expect(res.body.data.promoCode.code).toBe('FREE');
    expect(JSON.stringify(res.body)).not.toContain('07700 900123');
  });

  it('404s for a payment intent with no order', async () => {
    const res = await request(app).get('/api/orders/payment-intent/pi_nope');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/orders/sync', () => {
  it('returns the same sanitised shape as the GET', async () => {
    await seedOrder('pi_expose_sync');
    stripeMockState.paymentIntents.set('pi_expose_sync', {
      id: 'pi_expose_sync',
      status: 'succeeded',
      amount_received: 578,
      metadata: { type: 'product-purchase' },
    });

    const res = await request(app)
      .post('/api/orders/sync')
      .send({ paymentIntentId: 'pi_expose_sync' });

    expect(res.status).toBe(200);
    expect(res.body.data.shippingAddress.phone).toBeUndefined();
    expect(res.body.data.shippingAddress.firstName).toBe('Ada');
    expect(JSON.stringify(res.body)).not.toContain('07700 900123');
  });

  it('rejects a payment that has not succeeded', async () => {
    stripeMockState.paymentIntents.set('pi_unpaid', {
      id: 'pi_unpaid', status: 'requires_payment_method', metadata: { type: 'product-purchase' },
    });

    const res = await request(app)
      .post('/api/orders/sync')
      .send({ paymentIntentId: 'pi_unpaid' });

    expect(res.status).toBe(402);
    expect(await OrderModel.countDocuments()).toBe(0);
  });
});
