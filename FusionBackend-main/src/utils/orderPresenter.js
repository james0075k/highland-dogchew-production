/**
 * orderPresenter.js — the single definition of "what a customer may see of an order".
 *
 * Two endpoints hand an order back to the browser: GET /api/orders/payment-intent/:id
 * and POST /api/orders/sync. They used to disagree — the GET stripped the phone
 * number, the POST returned the raw Mongo document — so the same receipt exposed
 * different data depending on which path won a race. This function is now the
 * only shaping either one does.
 *
 * Omitted on purpose:
 *   phone — the receipt never renders it, so there is no reason to send it
 *   __v, internal promo bookkeeping (raceLost, customerIP, stripePromotionCodeId)
 */

export function toCustomerOrder(order) {
  if (!order) return null;

  // Mongoose documents need converting before spreading, plain objects (.lean())
  // pass straight through.
  const o = typeof order.toObject === 'function' ? order.toObject() : order;

  const {
    shippingAddress,
    promoCode,
    __v,
    ...rest
  } = o;

  const addr = shippingAddress || {};

  return {
    ...rest,
    shippingAddress: {
      fullName:     addr.fullName,
      // The receipt greets the customer by first name — it must be present on
      // both paths or the greeting silently degrades to a split of fullName.
      firstName:    addr.firstName,
      lastName:     addr.lastName,
      email:        addr.email,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city:         addr.city,
      county:       addr.county,
      postcode:     addr.postcode,
      country:      addr.country,
    },
    // Only what the receipt shows about the discount, never the audit trail.
    ...(promoCode?.code
      ? { promoCode: { code: promoCode.code, discountAmount: promoCode.discountAmount } }
      : {}),
  };
}

export default toCustomerOrder;
