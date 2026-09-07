/**
 * What the review endpoints are allowed to expose, and who is allowed to write.
 *
 * GET /api/reviews was mounted with no auth at all: it returned every review —
 * including ones still pending moderation, ones already rejected, and the
 * reviewer's email address — to anyone who knew the URL. The public product
 * endpoint filtered by status correctly but still shipped the email field.
 *
 * The write side had the mirror-image problem: createReview passed req.body
 * straight into ReviewModel.create, so a client could post status:'approved'
 * and publish to the live site without an admin ever seeing it.
 *
 * These tests pin down both halves.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { buildApp } from './helpers/buildApp.js';
import { createProduct } from './helpers/factories.js';
import ReviewModel from '../src/models/reviewModel.js';
import AdminModel from '../src/models/adminModel.js';
// Config captures jwtSecret at import time, which happens before tests/setup.js
// can set a fake one — so sign with the value the middleware actually verifies.
import Config from '../src/config/Config.js';

const app = buildApp();

const REVIEWER_EMAIL = 'reviewer@test.local';

/** An admin row plus a signed token for it — authenticate() looks the id up. */
async function createAdminWithToken(role = 'admin') {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const admin = await AdminModel.create({
    fullName: `Test ${role}`,
    email: `${role}-${unique}@test.local`,
    phoneNumber: `0700${unique.replace(/\D/g, '').slice(0, 8)}`,
    password: 'test-password',
    role,
  });
  const token = jwt.sign({ id: admin._id.toString() }, Config.jwtSecret);
  return { admin, token };
}

async function seedReview(overrides = {}) {
  return ReviewModel.create({
    guestInfo: { name: 'Ada Lovelace', email: REVIEWER_EMAIL },
    rating: 5,
    comment: 'My dog loved it.',
    status: 'approved',
    ...overrides,
  });
}

let product;

beforeEach(async () => {
  product = await createProduct();
});

describe('GET /api/reviews (admin list)', () => {
  it('rejects a request with no token', async () => {
    await seedReview({ product: product._id, status: 'pending' });

    const res = await request(app).get('/api/reviews');

    expect(res.status).toBe(401);
    // The pending review and the reviewer's email must not leak in the error body
    expect(JSON.stringify(res.body)).not.toContain(REVIEWER_EMAIL);
  });

  it('returns every status to an authenticated admin', async () => {
    await seedReview({ product: product._id, status: 'pending' });
    await seedReview({ product: product._id, status: 'rejected' });
    const { token } = await createAdminWithToken('admin');

    const res = await request(app)
      .get('/api/reviews')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const statuses = res.body.data.map((r) => r.status).sort();
    expect(statuses).toEqual(['pending', 'rejected']);
  });
});

describe('GET /api/reviews/product/:productId (public)', () => {
  it('returns approved reviews without the reviewer email', async () => {
    await seedReview({ product: product._id, status: 'approved' });
    await seedReview({ product: product._id, status: 'pending', comment: 'Not yet moderated' });

    const res = await request(app).get(`/api/reviews/product/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].comment).toBe('My dog loved it.');
    expect(res.body.data[0].guestInfo.email).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(REVIEWER_EMAIL);
  });
});

describe('GET /api/reviews/:tourId (public, legacy)', () => {
  it('hides unmoderated tour reviews and the reviewer email', async () => {
    const tourId = '507f1f77bcf86cd799439011';
    await seedReview({ tour: tourId, status: 'approved' });
    await seedReview({ tour: tourId, status: 'pending', comment: 'Not yet moderated' });

    const res = await request(app).get(`/api/reviews/${tourId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].comment).toBe('My dog loved it.');
    expect(JSON.stringify(res.body)).not.toContain(REVIEWER_EMAIL);
  });
});

describe('POST /api/reviews (public)', () => {
  it('stores a submitted review as pending', async () => {
    const res = await request(app).post('/api/reviews').send({
      product: product._id.toString(),
      guestInfo: { name: 'Grace Hopper', email: 'grace@test.local' },
      rating: 4,
      comment: 'Good chew.',
    });

    expect(res.status).toBe(201);
    const stored = await ReviewModel.findOne({ 'guestInfo.name': 'Grace Hopper' });
    expect(stored.status).toBe('pending');
    expect(stored.rating).toBe(4);
  });

  it('ignores a client-supplied status instead of self-publishing', async () => {
    const res = await request(app).post('/api/reviews').send({
      product: product._id.toString(),
      guestInfo: { name: 'Mallory', email: 'mallory@test.local' },
      rating: 5,
      comment: 'Buy my product instead!',
      status: 'approved',
      isDeleted: false,
    });

    expect(res.status).toBe(201);
    const stored = await ReviewModel.findOne({ 'guestInfo.name': 'Mallory' });
    expect(stored.status).toBe('pending');

    // And it must not show up on the public product endpoint
    const publicRes = await request(app).get(`/api/reviews/product/${product._id}`);
    expect(JSON.stringify(publicRes.body)).not.toContain('Buy my product instead!');
  });
});

describe('GET /api/reviews/stats (public)', () => {
  it('averages only approved reviews', async () => {
    await seedReview({ product: product._id, status: 'approved', rating: 5 });
    await seedReview({ product: product._id, status: 'approved', rating: 4 });
    // Neither of these may move the published average
    await seedReview({ product: product._id, status: 'pending', rating: 1 });
    await seedReview({ product: product._id, status: 'rejected', rating: 1 });

    const res = await request(app).get('/api/reviews/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.byProduct[product._id.toString()]).toEqual({ count: 2, rating: 4.5 });
    expect(res.body.data.site).toEqual({ count: 2, rating: 4.5 });
  });

  it('rolls ratings up per productType for the storefront markup', async () => {
    const puffProduct = await createProduct({ productType: 'puff-treat' });
    await seedReview({ product: product._id, status: 'approved', rating: 5 }); // yak-milk
    await seedReview({ product: puffProduct._id, status: 'approved', rating: 3 });
    await seedReview({ product: puffProduct._id, status: 'approved', rating: 4 });

    const res = await request(app).get('/api/reviews/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.byType['yak-milk']).toEqual({ count: 1, rating: 5 });
    expect(res.body.data.byType['puff-treat']).toEqual({ count: 2, rating: 3.5 });
  });

  it('reports zero for a product with no approved reviews', async () => {
    await seedReview({ product: product._id, status: 'pending', rating: 5 });

    const res = await request(app).get('/api/reviews/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.byProduct[product._id.toString()]).toBeUndefined();
    expect(res.body.data.site.count).toBe(0);
  });
});

describe('review moderation roles', () => {
  it('lets a superadmin approve a review', async () => {
    const review = await seedReview({ product: product._id, status: 'pending' });
    const { token } = await createAdminWithToken('superadmin');

    const res = await request(app)
      .put(`/api/reviews/${review._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  it('rejects moderation without a token', async () => {
    const review = await seedReview({ product: product._id, status: 'pending' });

    const res = await request(app)
      .put(`/api/reviews/${review._id}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(401);
    const stored = await ReviewModel.findById(review._id);
    expect(stored.status).toBe('pending');
  });
});
