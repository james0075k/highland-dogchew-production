/**
 * The masthead is shared by every email we send, and the logo it references is
 * attached by sendEmail rather than by each call site — so a new template can't
 * ship with a broken header because someone forgot the attachment.
 *
 * These tests cover the transactional templates (receipts, admin alerts,
 * subscription mail), which have roughly ten call sites between them.
 */

import { describe, it, expect } from 'vitest';
import {
  customerOrderEmailHtml,
  adminOrderEmailHtml,
  subscriptionRenewalEmailHtml,
} from '../src/utils/emailTemplates.js';
import { LOGO_CID } from '../src/utils/emailBrand.js';
import { heroAttachment } from '../src/utils/emailAssets.js';

const ORDER = {
  orderNumber: 'HD-TEST-000001',
  items: [{ name: 'Blueberry dog chew', size: 'Small 30-40g', quantity: 1, unitPrice: 3.79 }],
  shippingAddress: {
    fullName: 'Ada Lovelace', firstName: 'Ada', email: 'buyer@test.local',
    addressLine1: '1 Test St', city: 'London', postcode: 'E1 6AN', country: 'United Kingdom',
  },
  subtotal: 3.79, totalTax: 0, totalDiscount: 0, totalDelivery: 2.99, grandTotal: 6.78,
  paymentStatus: 'paid', createdAt: new Date(),
};

describe('the shared masthead', () => {
  const templates = {
    'customer order confirmation': () => customerOrderEmailHtml(ORDER, 'Ada'),
    'admin order alert': () => adminOrderEmailHtml(ORDER, { paymentIntentId: 'pi_test' }),
    'subscription renewal': () => subscriptionRenewalEmailHtml(
      { intervalWeeks: 4, nextBillingDate: new Date(), shippingAddress: ORDER.shippingAddress }, ORDER),
  };

  for (const [name, render] of Object.entries(templates)) {
    it(`${name} carries the logo and a title-case serif wordmark`, () => {
      const html = render();
      expect(html).toContain(`cid:${LOGO_CID}`);
      expect(html).toContain('Highland Yak Chew');
      // The old lowercase letterspaced wordmark must be gone
      expect(html).not.toContain('highland yak chew');
      expect(html).toContain('Georgia');
    });
  }

  it('has a logo asset on disk for that reference to resolve to', () => {
    const [logo] = heroAttachment('logo');
    expect(logo).toBeTruthy();
    expect(logo.cid).toBe(LOGO_CID);
    // PNG, or the transparency is lost against the dark header
    expect(logo.contentType).toBe('image/png');
    expect(logo.content.length).toBeGreaterThan(1000);
  });
});
