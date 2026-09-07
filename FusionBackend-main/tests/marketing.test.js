/**
 * Marketing sends: who gets mailed, who must not, and what gets recorded.
 *
 * The rules that matter here are the ones that are expensive to get wrong.
 * Mailing someone who unsubscribed is a PECR breach, not a bug report; mailing
 * the same customer twice about one order is the kind of thing that turns a
 * review request into an annoyance. Both are pinned down below.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import './helpers/emailMock.js';
import { sentEmails, resetEmailMock, emailMockState } from './helpers/emailMock.js';
import { buildApp } from './helpers/buildApp.js';
import { createProduct } from './helpers/factories.js';
import OrderModel from '../src/models/orderModel.js';
import AdminModel from '../src/models/adminModel.js';
import Subscriber from '../src/models/subscriberModel.js';
import MarketingOptOutModel from '../src/models/marketingOptOutModel.js';
import EmailCampaignModel from '../src/models/emailCampaignModel.js';
import { createUnsubscribeToken } from '../src/utils/marketingConsent.js';
import Config from '../src/config/Config.js';

const app = buildApp();

let token;

async function adminToken() {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const admin = await AdminModel.create({
    fullName: 'Test Admin',
    email: `admin-${unique}@test.local`,
    phoneNumber: `07${Math.floor(Math.random() * 1e9).toString().padStart(9, '0')}`,
    password: 'test-password',
    role: 'admin',
  });
  return jwt.sign({ id: admin._id.toString() }, Config.jwtSecret);
}

async function seedDeliveredOrder(email, overrides = {}) {
  const product = await createProduct();
  return OrderModel.create({
    items: [{ name: 'Blueberry yak chew', product: product._id, quantity: 1, unitPrice: 3.79, image: 'https://cdn/x.jpg' }],
    shippingAddress: {
      fullName: 'Ada Lovelace',
      firstName: 'Ada',
      email,
      addressLine1: '1 Test St',
      city: 'London',
      postcode: 'E1 6AN',
      country: 'United Kingdom',
    },
    subtotal: 3.79,
    grandTotal: 5.78,
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    deliveredAt: new Date(),
    ...overrides,
  });
}

beforeEach(async () => {
  resetEmailMock();
  token = await adminToken();
});

describe('review request sending', () => {
  it('emails the customer and records the send on the order', async () => {
    const order = await seedDeliveredOrder('buyer@test.local');

    const res = await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.data.sent).toBe(1);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe('buyer@test.local');
    // Personalised, and carrying a working unsubscribe route
    expect(sentEmails[0].html).toContain('Dear Ada,');
    expect(sentEmails[0].html).toContain('/newsletter/unsubscribe/');
    expect(sentEmails[0].headers['List-Unsubscribe']).toBeTruthy();

    const stored = await OrderModel.findById(order._id).lean();
    expect(stored.reviewRequest.sentAt).toBeTruthy();
    expect(stored.reviewRequest.count).toBe(1);
  });

  it('does not send twice for the same order', async () => {
    const order = await seedDeliveredOrder('buyer@test.local');

    await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    resetEmailMock();

    const res = await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.data.sent).toBe(0);
    expect(sentEmails).toHaveLength(0);
    expect(res.body.data.skipped[0].reason).toBe('Already sent');
  });

  it('skips a customer who has unsubscribed', async () => {
    const order = await seedDeliveredOrder('gone@test.local');
    await MarketingOptOutModel.create({ email: 'gone@test.local', scope: 'all' });

    const res = await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    expect(res.body.data.sent).toBe(0);
    expect(sentEmails).toHaveLength(0);
    expect(res.body.data.skipped[0].reason).toBe('Customer has unsubscribed');

    const stored = await OrderModel.findById(order._id).lean();
    expect(stored.reviewRequest.sentAt).toBeNull();
  });

  it('leaves the order unmarked when the send fails, so it can be retried', async () => {
    const order = await seedDeliveredOrder('bounces@test.local');
    emailMockState.failFor = (to) => to === 'bounces@test.local';

    const res = await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    expect(res.body.data.failed).toBe(1);
    const stored = await OrderModel.findById(order._id).lean();
    expect(stored.reviewRequest.sentAt).toBeNull();
  });

  it('requires an admin token', async () => {
    const order = await seedDeliveredOrder('buyer@test.local');

    const res = await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .send({ orderIds: [order._id.toString()] });

    expect(res.status).toBe(401);
    expect(sentEmails).toHaveLength(0);
  });
});

describe('review candidates', () => {
  it('lists delivered orders and flags ones already contacted', async () => {
    await seedDeliveredOrder('a@test.local');
    await seedDeliveredOrder('b@test.local', {
      reviewRequest: { sentAt: new Date(), count: 1 },
    });
    // Not delivered — must not appear under the default filter
    await seedDeliveredOrder('c@test.local', { orderStatus: 'processing', deliveredAt: null });

    const res = await request(app)
      .get('/api/admin/marketing/review-candidates')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const emails = res.body.data.candidates.map((c) => c.email).sort();
    expect(emails).toEqual(['a@test.local', 'b@test.local']);

    const b = res.body.data.candidates.find((c) => c.email === 'b@test.local');
    expect(b.alreadySentAt).toBeTruthy();
  });
});

describe('newsletter audience', () => {
  it('dedupes a customer who is also a subscriber, and drops opt-outs', async () => {
    await Subscriber.create({ email: 'both@test.local' });
    await Subscriber.create({ email: 'subonly@test.local' });
    await Subscriber.create({ email: 'optedout@test.local' });
    await seedDeliveredOrder('both@test.local');
    await seedDeliveredOrder('custonly@test.local');
    await MarketingOptOutModel.create({ email: 'optedout@test.local', scope: 'newsletter' });

    const res = await request(app)
      .get('/api/admin/marketing/newsletter/audience?source=both')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(3); // both, subonly, custonly
    expect(res.body.data.suppressedCount).toBe(1);

    const emails = res.body.data.recipients.map((r) => r.email).sort();
    expect(emails).toEqual(['both@test.local', 'custonly@test.local', 'subonly@test.local']);

    // The admin has to be able to see who is about to be mailed, so a customer
    // must arrive with their name and postal address attached.
    const customer = res.body.data.recipients.find((r) => r.email === 'custonly@test.local');
    expect(customer.name).toBe('Ada');
    expect(customer.address).toBe('1 Test St, London, E1 6AN');

    // Someone who only ever subscribed has no order, so no name or address.
    const subscriber = res.body.data.recipients.find((r) => r.email === 'subonly@test.local');
    expect(subscriber.name).toBe('');
    expect(subscriber.source).toBe('subscriber');
  });

  it('sends to the resolved audience and logs a campaign', async () => {
    await Subscriber.create({ email: 'reader@test.local' });

    const res = await request(app)
      .post('/api/admin/marketing/newsletter/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source: 'subscribers',
        subject: 'New flavour just landed',
        headline: 'Meet the Pumpkin chew',
        bodyHtml: '<p>Something new for autumn.</p>',
        ctaLabel: 'Shop now',
        ctaUrl: 'https://highlanddogchew.co.uk/products',
      });

    expect(res.status).toBe(200);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe('reader@test.local');
    expect(sentEmails[0].subject).toBe('New flavour just landed');
    expect(sentEmails[0].html).toContain('Meet the Pumpkin chew');
    expect(sentEmails[0].html).toContain('Something new for autumn.');

    const campaign = await EmailCampaignModel.findOne({ type: 'newsletter' }).lean();
    expect(campaign.sentCount).toBe(1);
    expect(campaign.status).toBe('sent');
  });

  it('a test send reaches only the tester and records no campaign', async () => {
    await Subscriber.create({ email: 'reader@test.local' });

    const res = await request(app)
      .post('/api/admin/marketing/newsletter/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source: 'subscribers',
        subject: 'Draft',
        headline: 'Draft headline',
        bodyHtml: '<p>Draft</p>',
        testTo: 'me@test.local',
      });

    expect(res.status).toBe(200);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe('me@test.local');
    expect(sentEmails[0].subject).toBe('[TEST] Draft');
    expect(await EmailCampaignModel.countDocuments()).toBe(0);
  });
});

describe('what the send reports back', () => {
  // The admin UI decides what to tell the operator from these numbers. When a
  // send fails, "sent: 0" is what stops the UI claiming the email went out.
  it('reports sent:0 and the reason when the mail server rejects it', async () => {
    await Subscriber.create({ email: 'reader@test.local' });
    emailMockState.failFor = () => true;

    const res = await request(app)
      .post('/api/admin/marketing/newsletter/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source: 'subscribers',
        subject: 'Will not arrive',
        headline: 'Nope',
        bodyHtml: '<p>Nope</p>',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.sent).toBe(0);
    expect(res.body.data.failed).toBe(1);
    expect(res.body.data.failures[0].error).toBe('Simulated SMTP failure');

    const campaign = await EmailCampaignModel.findOne({ type: 'newsletter' }).lean();
    expect(campaign.status).toBe('failed');
  });

  it('embeds the hero image so it renders without the site being deployed', async () => {
    const order = await seedDeliveredOrder('buyer@test.local');

    await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    const sent = sentEmails[0];
    // A cid: reference plus the matching attachment — not an http link that
    // breaks until the frontend ships the file.
    expect(sent.html).toContain('src="cid:hero@highlandyakchew"');
    const hero = sent.attachments.find((a) => a.cid === 'hero@highlandyakchew');
    expect(hero).toBeTruthy();
    expect(hero.content.length).toBeGreaterThan(1000);
    expect(sent.html).not.toContain('/images/email/');
  });
});

describe('unsubscribe', () => {
  it('honours a signed link and then excludes the address', async () => {
    await Subscriber.create({ email: 'leaving@test.local' });
    const unsubToken = createUnsubscribeToken('leaving@test.local', 'newsletter');

    const res = await request(app).get(`/api/newsletter/unsubscribe/${unsubToken}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/newsletter/unsubscribed?status=ok');

    expect(await MarketingOptOutModel.countDocuments({ email: 'leaving@test.local' })).toBe(1);
    const sub = await Subscriber.findOne({ email: 'leaving@test.local' }).lean();
    expect(sub.isActive).toBe(false);

    const audience = await request(app)
      .get('/api/admin/marketing/newsletter/audience?source=subscribers')
      .set('Authorization', `Bearer ${token}`);
    expect(audience.body.data.count).toBe(0);
  });

  it('is idempotent when the link is clicked twice', async () => {
    const unsubToken = createUnsubscribeToken('twice@test.local', 'newsletter');

    await request(app).get(`/api/newsletter/unsubscribe/${unsubToken}`);
    await request(app).get(`/api/newsletter/unsubscribe/${unsubToken}`);

    expect(await MarketingOptOutModel.countDocuments({ email: 'twice@test.local' })).toBe(1);
  });

  it('answers a one-click POST from a mail client with 200', async () => {
    const unsubToken = createUnsubscribeToken('oneclick@test.local', 'newsletter');

    const res = await request(app).post(`/api/newsletter/unsubscribe/${unsubToken}`);

    expect(res.status).toBe(200);
    expect(await MarketingOptOutModel.countDocuments({ email: 'oneclick@test.local' })).toBe(1);
  });

  it('rejects a tampered token without unsubscribing anyone', async () => {
    const res = await request(app).get('/api/newsletter/unsubscribe/not-a-real-token');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('status=invalid');
    expect(await MarketingOptOutModel.countDocuments()).toBe(0);
  });
});

describe('the review link in the email', () => {
  it('points at the specific product bought, not the product listing', async () => {
    const product = await createProduct({ name: 'Blueberry Dog Chew' });
    const order = await OrderModel.create({
      items: [{ name: 'Blueberry Dog Chew', product: product._id, quantity: 1, unitPrice: 3.79 }],
      shippingAddress: {
        fullName: 'Ada Lovelace', firstName: 'Ada', email: 'linktest@test.local',
        addressLine1: '1 Test St', city: 'London', postcode: 'E1 6AN', country: 'United Kingdom',
      },
      subtotal: 3.79, grandTotal: 3.79,
      paymentStatus: 'paid', orderStatus: 'delivered', deliveredAt: new Date(),
    });

    await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    const html = sentEmails[0].html;
    const stored = await (await import('../src/models/productModel.js')).default
      .findById(product._id).select('slug').lean();

    expect(html).toContain(`/products/${stored.slug}?review=1`);
    // The bare listing is only a fallback for a deleted product — it must not
    // be what a normal review request links to.
    expect(html).not.toMatch(/href="[^"]*\/products"/);
    expect(html).toContain('name=Ada');
  });
});

describe('deliverability', () => {
  it('sends multipart — an HTML-only message scores worse with spam filters', async () => {
    const order = await seedDeliveredOrder('buyer@test.local');

    await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    const sent = sentEmails[0];
    expect(sent.text).toBeTruthy();
    expect(sent.text).toContain('Dear Ada,');
    expect(sent.text).toContain('Unsubscribe:');
    // The text part must be real text, not markup that slipped through
    expect(sent.text).not.toMatch(/<[a-z][^>]*>/i);
  });
});

describe('review link hygiene', () => {
  it('trims stray whitespace from the name in the review link', async () => {
    const product = await createProduct({ name: 'Classic Dog Chew' });
    const order = await OrderModel.create({
      items: [{ name: 'Classic Dog Chew', product: product._id, quantity: 1, unitPrice: 4 }],
      shippingAddress: {
        // Checkout data really does arrive like this
        fullName: 'Monica Hill ', firstName: 'Monica ', email: 'trim@test.local',
        addressLine1: '38 Hangingroyd Road', city: 'Hebden Bridge', postcode: 'HX7 6AA',
        country: 'United Kingdom',
      },
      subtotal: 4, grandTotal: 4,
      paymentStatus: 'paid', orderStatus: 'delivered', deliveredAt: new Date(),
    });

    await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    const html = sentEmails[0].html;
    expect(html).toContain('name=Monica');
    expect(html).not.toContain('name=Monica+');   // trailing space encoded
    expect(html).toContain('Dear Monica,');       // not "Dear Monica ,"
  });
});

describe('branding in the masthead', () => {
  it('sends the logo and hero, and keeps the wordmark as live text', async () => {
    const order = await seedDeliveredOrder('buyer@test.local');

    await request(app)
      .post('/api/admin/marketing/review-requests/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderIds: [order._id.toString()] });

    const sent = sentEmails[0];

    // Both images travel with the message, under distinct content ids
    const cids = sent.attachments.map((a) => a.cid).sort();
    expect(cids).toEqual(['hero@highlandyakchew', 'logo@highlandyakchew']);
    expect(sent.attachments.find((a) => a.cid === 'logo@highlandyakchew').contentType)
      .toBe('image/png');   // PNG, or transparency is lost on the dark header

    expect(sent.html).toContain('src="cid:logo@highlandyakchew"');
    // Title case, serif, and real text — so branding survives blocked images
    expect(sent.html).toContain('Highland Yak Chew');
    expect(sent.html).not.toContain('highland yak chew');
    expect(sent.html).toContain('Georgia');
  });
});

describe('real sends use the customer\'s own details', () => {
  it('greets each newsletter recipient by their own name, never a placeholder', async () => {
    // Two customers with different names, plus a subscriber with no name at all
    await seedDeliveredOrder('winston@test.local', {
      shippingAddress: {
        fullName: 'Winston Churchill', firstName: 'Winston', email: 'winston@test.local',
        addressLine1: '10 Downing St', city: 'London', postcode: 'SW1A 2AA', country: 'United Kingdom',
      },
    });
    await seedDeliveredOrder('priya@test.local', {
      shippingAddress: {
        fullName: 'Priya Patel', firstName: 'Priya', email: 'priya@test.local',
        addressLine1: '2 Mill Lane', city: 'Leeds', postcode: 'LS1 4AP', country: 'United Kingdom',
      },
    });
    await Subscriber.create({ email: 'anon@test.local' });

    await request(app)
      .post('/api/admin/marketing/newsletter/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'both', subject: 'S', headline: 'H', bodyHtml: '<p>b</p>' });

    const byTo = Object.fromEntries(sentEmails.map((e) => [e.to, e.html]));

    expect(byTo['winston@test.local']).toContain('Dear Winston,');
    expect(byTo['priya@test.local']).toContain('Dear Priya,');
    // A subscriber never gave us a name, so no greeting rather than a fake one
    expect(byTo['anon@test.local']).not.toContain('Dear ');

    // No message may carry another customer's name or a preview placeholder
    expect(byTo['winston@test.local']).not.toContain('Priya');
    expect(byTo['priya@test.local']).not.toContain('Winston');
    for (const html of Object.values(byTo)) {
      expect(html).not.toContain('{first name}');
      expect(html).not.toContain('Dear Test,');
      expect(html).not.toContain('Dear Ada,');
    }
  });

  it('shows a visible placeholder in a test send, not a real-looking name', async () => {
    await Subscriber.create({ email: 'reader@test.local' });

    await request(app)
      .post('/api/admin/marketing/newsletter/send')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'subscribers', subject: 'S', headline: 'H', bodyHtml: '<p>b</p>', testTo: 'me@test.local' });

    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe('me@test.local');
    expect(sentEmails[0].html).toContain('{first name}');
  });
});
