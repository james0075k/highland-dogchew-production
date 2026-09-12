/**
 * A product's headline rating must reflect its approved reviews.
 *
 * product.rating / product.reviews began life as fields an admin typed in by
 * hand, and nothing ever reconciled them with the Review collection. So a
 * product could carry a real five-star review while its card and its page both
 * showed an empty star row — which is what customers were seeing.
 *
 * Approving, rejecting and deleting a review all have to keep them in step.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { buildApp } from './helpers/buildApp.js';
import { createProduct, createVariety } from './helpers/factories.js';
import ProductModel from '../src/models/productModel.js';
import ReviewModel from '../src/models/reviewModel.js';
import AdminModel from '../src/models/adminModel.js';
import Config from '../src/config/Config.js';

const app = buildApp();
let token;
let product;

beforeEach(async () => {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const admin = await AdminModel.create({
    fullName: 'Test Admin',
    email: `admin-${unique}@test.local`,
    phoneNumber: `07${Math.floor(Math.random() * 1e9).toString().padStart(9, '0')}`,
    password: 'test-password',
    role: 'admin',
  });
  token = jwt.sign({ id: admin._id.toString() }, Config.jwtSecret);
  product = await createProduct({ rating: 0, reviews: 0 });
});

const auth = (r) => r.set('Authorization', `Bearer ${token}`);

/**
 * Seeds a pending review directly. Deliberately not via POST /api/reviews:
 * that route is rate-limited to 5/hour per IP, so a file with several tests
 * would start failing on the limiter rather than on the behaviour under test.
 * The public submission path has its own coverage in reviewExposure.test.js.
 */
async function submitReview(rating, name = 'Lucy') {
  const review = await ReviewModel.create({
    product: product._id,
    guestInfo: { name, email: `${name.toLowerCase()}@test.local` },
    rating,
    comment: 'Long lasting, my dog loved it.',
    status: 'pending',
  });
  return review._id.toString();
}

const productNow = () => ProductModel.findById(product._id).select('rating reviews').lean();

describe('product rating stays in step with approved reviews', () => {
  it('a pending review does not move the product rating', async () => {
    await submitReview(5);
    const p = await productNow();
    expect(p.rating).toBe(0);
    expect(p.reviews).toBe(0);
  });

  it('approving a review publishes it to the product', async () => {
    const id = await submitReview(5);

    await auth(request(app).put(`/api/reviews/${id}`)).send({ status: 'approved' });

    const p = await productNow();
    expect(p.rating).toBe(5);
    expect(p.reviews).toBe(1);
  });

  it('averages several approved reviews to one decimal place', async () => {
    const a = await submitReview(5, 'Lucy');
    const b = await submitReview(4, 'Sam');
    for (const id of [a, b]) {
      await auth(request(app).put(`/api/reviews/${id}`)).send({ status: 'approved' });
    }

    const p = await productNow();
    expect(p.rating).toBe(4.5);
    expect(p.reviews).toBe(2);
  });

  it('rejecting an approved review takes it back off the product', async () => {
    const id = await submitReview(5);
    await auth(request(app).put(`/api/reviews/${id}`)).send({ status: 'approved' });

    await auth(request(app).put(`/api/reviews/${id}`)).send({ status: 'rejected' });

    const p = await productNow();
    expect(p.rating).toBe(0);
    expect(p.reviews).toBe(0);
  });

  it('deleting an approved review updates the product too', async () => {
    const a = await submitReview(5, 'Lucy');
    const b = await submitReview(3, 'Sam');
    for (const id of [a, b]) {
      await auth(request(app).put(`/api/reviews/${id}`)).send({ status: 'approved' });
    }

    await auth(request(app).delete(`/api/reviews/${a}`));

    const p = await productNow();
    expect(p.rating).toBe(3);
    expect(p.reviews).toBe(1);
  });

  it('works for every product type, not just one', async () => {
    for (const productType of ['yak-milk', 'puff-treat', 'highland-mix']) {
      const p = await createProduct({ productType, rating: 0, reviews: 0 });
      const review = await ReviewModel.create({
        product: p._id, guestInfo: { name: 'Lucy' }, rating: 4, status: 'pending',
      });

      await auth(request(app).put(`/api/reviews/${review._id}`)).send({ status: 'approved' });

      const updated = await ProductModel.findById(p._id).select('rating reviews').lean();
      expect(updated.rating, productType).toBe(4);
      expect(updated.reviews, productType).toBe(1);
    }
  });
});

/**
 * product.rating / product.reviews must only ever move via syncProductRating
 * (i.e. via approving/rejecting/deleting a review). The admin product form
 * used to also submit these two fields on every save — including an
 * unrelated price or description change — which silently overwrote whatever
 * the reviews had computed. Lock the product write endpoints down so they
 * can't be used to set these fields at all.
 */
describe("the product API can't be used to set rating/reviews directly", () => {
  it('ignores a client-supplied rating and review count on update', async () => {
    const synced = await createProduct({ rating: 4.5, reviews: 20 });

    const res = await auth(request(app).put(`/api/products/${synced._id}`))
      .send({ price: 15, rating: 1, reviews: 999 });

    expect(res.status).toBe(200);
    const p = await ProductModel.findById(synced._id).select('price rating reviews').lean();
    expect(p.price).toBe(15); // the actual edit still applies
    expect(p.rating).toBe(4.5); // untouched by the attempted overwrite
    expect(p.reviews).toBe(20);
  });

  it('ignores a client-supplied rating and review count on create', async () => {
    const variety = await createVariety();

    const res = await auth(request(app).post('/api/products'))
      .field('name', 'Yak Snack')
      .field('price', '9.99')
      .field('originalPrice', '12.99')
      .field('category', 'Original')
      .field('productType', 'yak-milk')
      .field('variety', variety._id.toString())
      .field('description', 'A test snack')
      .field('rating', '5')
      .field('reviews', '999')
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'test.png');

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(0);
    expect(res.body.data.reviews).toBe(0);
  });
});
