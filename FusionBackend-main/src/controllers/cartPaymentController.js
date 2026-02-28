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

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInPence,
      currency: 'gbp',
      metadata: {
        type:      'product-purchase',
        itemCount: items.length.toString(),
        items:     JSON.stringify(lineItems.map((l) => `${l.name} x${l.quantity}`)),
        promoCode: promoData ? promoData.code : '',
        discount:  discount.toString(),
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
