import Stripe from 'stripe';
import ProductModel from '../models/productModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { cartValidationSchema } from '../validations/cartValidationSchema.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TAX_RATE        = 0.20;  // 20% VAT
const DELIVERY_CHARGE = 2.99;  // per unique line item

// ─── Custom error so helpers can throw structured errors ──────────────────────
class CartError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ─── Resolve promo code discount (async — DB lookup) ─────────────────────────
async function resolvePromo(promoCode, subtotal) {
  if (!promoCode) return { discount: 0, promoData: null };

  const promo = await PromoCodeModel.findOne({ code: promoCode.toUpperCase() });
  if (!promo || !promo.isActive)                                     return { discount: 0, promoData: null };
  if (promo.expiryDate && new Date() > promo.expiryDate)             return { discount: 0, promoData: null };
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) return { discount: 0, promoData: null };
  if (subtotal < promo.minOrderAmount)                               return { discount: 0, promoData: null };

  const discount = promo.discountType === 'percentage'
    ? +(subtotal * (promo.discountValue / 100)).toFixed(2)
    : +Math.min(promo.discountValue, subtotal).toFixed(2);

  return { discount, promoData: promo };
}

// ─── Core: validate all items server-side and compute totals ──────────────────
//
// Price priority (highest wins):
//   1. bulkPricing match  — quantity-specific deal
//   2. sizes match        — size-specific price (e.g. SMALL/MEDIUM/LARGE)
//   3. product.price      — base/fallback price
//
// Security: never expose the server-expected price in error messages — that
// would let a bad actor learn the canonical price without a purchase.
//
async function resolveAndCalculate(items, promoCode) {
  // Single DB round-trip for all products
  const products = await ProductModel.find({
    _id: { $in: items.map((i) => i.productId) },
  }).lean();

  const productMap = {};
  products.forEach((p) => { productMap[p._id.toString()] = p; });

  let subtotal  = 0;
  const lineItems = [];

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) {
      throw new CartError(404, 'One or more products in your cart are no longer available.');
    }

    // ── Resolve authoritative server-side price ────────────────────────────
    // Priority: bulkPricing > size-specific > base product.price
    // The client's unitPrice is IGNORED — the Stripe charge is always
    // computed here, so the client cannot manipulate what they're charged.
    let expectedPrice = product.price; // base fallback

    // Size-specific price overrides the base price
    if (item.size && product.sizes?.length > 0) {
      const sizeData = product.sizes.find(
        (s) => s.label === item.size || s.value === item.size
      );
      if (sizeData?.price != null) expectedPrice = sizeData.price;
    }

    // Bulk pricing overrides everything (quantity-level discount)
    if (product.bulkPricing?.length > 0) {
      const bulk = product.bulkPricing.find((b) => b.quantity === item.quantity);
      if (bulk) expectedPrice = bulk.price;
    }

    const lineTotal = +(expectedPrice * item.quantity).toFixed(2);
    subtotal += lineTotal;

    lineItems.push({
      productId: item.productId,
      name:      product.name,
      size:      item.size,
      quantity:  item.quantity,
      unitPrice: expectedPrice,
      lineTotal,
    });
  }

  subtotal = +subtotal.toFixed(2);

  const { discount, promoData } = await resolvePromo(promoCode, subtotal);
  const discountedSubtotal      = +(subtotal - discount).toFixed(2);
  const totalTax                = +(discountedSubtotal * TAX_RATE).toFixed(2);
  const totalDelivery           = +(items.length * DELIVERY_CHARGE).toFixed(2);
  const grandTotal              = +(discountedSubtotal + totalTax + totalDelivery).toFixed(2);

  return { lineItems, subtotal, discount, promoData, totalTax, totalDelivery, grandTotal };
}

// ─── POST /api/cart-payments/validate ────────────────────────────────────────
// Lightweight check — confirms prices are still current before the user fills
// in their card details.
export const validateCart = async (req, res, next) => {
  try {
    const { error, value } = cartValidationSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    const result = await resolveAndCalculate(value.items, value.promoCode);

    return handleSuccess(res, 200, 'Cart validated successfully', {
      items:         result.lineItems,
      subtotal:      result.subtotal,
      discount:      result.discount,
      totalTax:      result.totalTax,
      totalDelivery: result.totalDelivery,
      grandTotal:    result.grandTotal,
    });
  } catch (err) {
    if (err instanceof CartError) return next(handleError(err.status, err.message));
    next(err);
  }
};

// ─── POST /api/cart-payments/create-payment-intent ───────────────────────────
// Validates prices server-side then creates a Stripe PaymentIntent.
// The charge amount is ALWAYS calculated here — it is NEVER taken from the client.
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { error, value } = cartValidationSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    const { items, promoCode } = value;

    const { lineItems, subtotal, discount, promoData, totalTax, totalDelivery, grandTotal }
      = await resolveAndCalculate(items, promoCode);

    // Stripe requires the smallest currency unit (pence for GBP)
    const amountInPence = Math.round(grandTotal * 100);

    // Serialise line items for webhook — Stripe metadata values max 500 chars.
    // We store the full array; if it exceeds the limit we fall back to a
    // compact summary (name + qty) so the webhook can still create the order.
    const fullItemsJson    = JSON.stringify(lineItems);
    const compactItemsJson = JSON.stringify(
      lineItems.map((l) => ({ name: l.name, size: l.size, quantity: l.quantity, unitPrice: l.unitPrice, lineTotal: l.lineTotal }))
    );
    const itemsMeta = fullItemsJson.length <= 490 ? fullItemsJson : compactItemsJson;

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        type:          'product-purchase',
        itemCount:     items.length.toString(),
        items:         itemsMeta,
        promoCode:     promoData ? promoData.code : '',
        discount:      discount.toString(),
        subtotal:      subtotal.toString(),
        totalTax:      totalTax.toString(),
        totalDelivery: totalDelivery.toString(),
        grandTotal:    grandTotal.toString(),
        currency:      'gbp',
      },
    });

    return handleSuccess(res, 200, 'Payment intent created', {
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount:          grandTotal,
      breakdown: {
        subtotal,
        discount,
        totalTax,
        totalDelivery,
        grandTotal,
      },
    });
  } catch (err) {
    if (err instanceof CartError) return next(handleError(err.status, err.message));
    next(err);
  }
};

// ─── POST /api/cart-payments/update-meta ─────────────────────────────────────
// Called by the frontend just before stripe.confirmPayment() to attach
// customer and shipping details to the PaymentIntent metadata so the
// webhook can create a complete order without any frontend involvement.
//
// Security notes:
//   • Only customer/shipping fields are written — pricing is never touched
//     here because it was locked in PI.amount at creation time.
//   • We verify the PI exists and is still in a processable state before
//     updating, so stale or invalid IDs are rejected.
export const updatePaymentIntentMeta = async (req, res, next) => {
  try {
    const { paymentIntentId, customer, shipping } = req.body;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return next(handleError(400, 'paymentIntentId is required'));
    }
    if (!customer?.email || !customer?.firstName || !customer?.lastName) {
      return next(handleError(400, 'customer.firstName, customer.lastName and customer.email are required'));
    }
    if (!shipping?.address || !shipping?.city || !shipping?.postcode) {
      return next(handleError(400, 'shipping.address, shipping.city and shipping.postcode are required'));
    }

    // Verify the PaymentIntent exists and can still be updated
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi || pi.metadata?.type !== 'product-purchase') {
      return next(handleError(400, 'Invalid payment reference'));
    }
    if (['succeeded', 'canceled'].includes(pi.status)) {
      return next(handleError(400, 'Payment has already been completed or cancelled'));
    }

    // Update only customer/shipping keys — never touch pricing keys
    await stripe.paymentIntents.update(paymentIntentId, {
      receipt_email: customer.email,
      metadata: {
        c_firstName: String(customer.firstName).slice(0, 100),
        c_lastName:  String(customer.lastName).slice(0, 100),
        c_email:     String(customer.email).slice(0, 200),
        c_phone:     String(customer.phone || '').slice(0, 30),
        s_line1:     String(shipping.address).slice(0, 200),
        s_line2:     String(shipping.apartment || '').slice(0, 200),
        s_city:      String(shipping.city).slice(0, 100),
        s_county:    String(shipping.county || '').slice(0, 100),
        s_postcode:  String(shipping.postcode).slice(0, 20),
        s_country:   String(shipping.country || 'United Kingdom').slice(0, 100),
      },
    });

    return handleSuccess(res, 200, 'Order details saved', {});
  } catch (err) {
    if (err instanceof CartError) return next(handleError(err.status, err.message));
    if (err.type?.startsWith('Stripe')) {
      return next(handleError(400, err.message));
    }
    next(err);
  }
};
