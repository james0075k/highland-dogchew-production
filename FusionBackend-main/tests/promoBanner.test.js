/**
 * The homepage discount banner.
 *
 * The public endpoint is read by the homepage and /discount-code, so it must
 * expose only the single code the admin chose — never the code list — and must
 * hide itself when that code can't actually be redeemed at checkout.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { buildApp } from './helpers/buildApp.js';
import PromoCodeModel from '../src/models/promoCodeModel.js';
import PromoBannerModel from '../src/models/promoBannerModel.js';
import AdminModel from '../src/models/adminModel.js';
import Config from '../src/config/Config.js';

const app = buildApp();

async function adminToken(role = 'admin') {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const admin = await AdminModel.create({
    fullName: `Test ${role}`,
    email: `${role}-${unique}@test.local`,
    phoneNumber: `0700${unique.replace(/\D/g, '').slice(0, 8)}`,
    password: 'test-password',
    role,
  });
  return jwt.sign({ id: admin._id.toString() }, Config.jwtSecret);
}

const createPromo = (overrides = {}) =>
  PromoCodeModel.create({ code: 'FRANK10', discountType: 'percentage', discountValue: 10, ...overrides });

describe('GET /api/promo-banner (public)', () => {
  it('serves FRANK10 with suggested text before any banner is saved', async () => {
    await createPromo();

    const res = await request(app).get('/api/promo-banner');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      enabled: true,
      leadText: '10% off every chew with code',
      code: 'FRANK10',
      discountLabel: '10% off',
    });
  });

  it('shows only the chosen code, never the others', async () => {
    await createPromo();
    const chosen = await createPromo({ code: 'SAVE5', discountType: 'flat', discountValue: 5 });
    await createPromo({ code: 'SECRETSTAFF50', discountValue: 50 });
    await PromoBannerModel.create({ enabled: true, leadText: 'Spring treat:', promoCode: chosen._id });

    const res = await request(app).get('/api/promo-banner');

    expect(res.body.data).toMatchObject({ enabled: true, leadText: 'Spring treat:', code: 'SAVE5', discountLabel: '£5 off' });
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('SECRETSTAFF50');
    expect(body).not.toContain('FRANK10');
  });

  it.each([
    ['inactive', { isActive: false }],
    ['expired', { expiryDate: new Date(Date.now() - 60_000) }],
    ['used up', { usageLimit: 3, usageCount: 3 }],
  ])('hides the banner when the chosen code is %s', async (_label, overrides) => {
    const promo = await createPromo(overrides);
    await PromoBannerModel.create({ enabled: true, leadText: 'Deal', promoCode: promo._id });

    const res = await request(app).get('/api/promo-banner');

    expect(res.body.data).toEqual({ enabled: false, leadText: '', code: null, discountLabel: null });
  });

  it('hides the banner when the admin switched it off', async () => {
    const promo = await createPromo();
    await PromoBannerModel.create({ enabled: false, leadText: 'Deal', promoCode: promo._id });

    const res = await request(app).get('/api/promo-banner');

    expect(res.body.data.enabled).toBe(false);
    expect(JSON.stringify(res.body)).not.toContain('FRANK10');
  });

  it('hides the banner when no default code exists yet', async () => {
    const res = await request(app).get('/api/promo-banner');
    expect(res.body.data.enabled).toBe(false);
  });
});

describe('admin endpoints', () => {
  it('require a login', async () => {
    expect((await request(app).get('/api/promo-banner/admin')).status).toBe(401);
    expect((await request(app).put('/api/promo-banner').send({})).status).toBe(401);
  });

  it('list codes without redemption emails or IPs', async () => {
    await createPromo({ redeemedEmails: ['customer@test.local'], redeemedIPs: ['1.2.3.4'] });
    const token = await adminToken();

    const res = await request(app).get('/api/promo-banner/admin').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.settings).toMatchObject({ saved: false, enabled: true, leadText: '10% off every chew with code' });
    expect(res.body.data.codes[0]).toMatchObject({ code: 'FRANK10', status: 'active' });
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('customer@test.local');
    expect(body).not.toContain('1.2.3.4');
  });

  it('first save creates the banner, later saves update the same document', async () => {
    const promo = await createPromo();
    const token = await adminToken();
    const put = (body) => request(app).put('/api/promo-banner').set('Authorization', `Bearer ${token}`).send(body);

    expect((await put({ enabled: true, leadText: 'Autumn sale:', promoCodeId: promo._id.toString() })).status).toBe(200);
    expect((await put({ enabled: true, leadText: 'Winter sale:', promoCodeId: promo._id.toString() })).status).toBe(200);

    const docs = await PromoBannerModel.find().lean();
    expect(docs).toHaveLength(1);
    expect(docs[0].leadText).toBe('Winter sale:');
    expect((await request(app).get('/api/promo-banner')).body.data.leadText).toBe('Winter sale:');
  });

  it('refuses to put an unusable code on the banner', async () => {
    const promo = await createPromo({ isActive: false });
    const token = await adminToken();

    const res = await request(app).put('/api/promo-banner').set('Authorization', `Bearer ${token}`)
      .send({ enabled: true, leadText: 'Deal', promoCodeId: promo._id.toString() });

    expect(res.status).toBe(400);
    expect(await PromoBannerModel.countDocuments()).toBe(0);
  });

  it('rejects a missing code, empty text and markup', async () => {
    const promo = await createPromo();
    const token = await adminToken();
    const put = (body) => request(app).put('/api/promo-banner').set('Authorization', `Bearer ${token}`).send(body);

    expect((await put({ enabled: true, leadText: 'Deal', promoCodeId: '0123456789abcdef01234567' })).status).toBe(400);
    expect((await put({ enabled: true, leadText: '   ', promoCodeId: promo._id.toString() })).status).toBe(400);
    expect((await put({ enabled: true, leadText: '<script>x</script>', promoCodeId: promo._id.toString() })).status).toBe(400);
    expect((await put({ enabled: true, leadText: 'x'.repeat(81), promoCodeId: promo._id.toString() })).status).toBe(400);
  });
});
