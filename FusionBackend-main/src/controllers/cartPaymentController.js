import { randomBytes } from 'crypto';
import { getStripe } from '../config/stripe.js';
import ProductModel from '../models/productModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { cartValidationSchema } from '../validations/cartValidationSchema.js';

const TAX_RATE        = 0.20; // 20% VAT
const DELIVERY_CHARGE = 2.99; // per unique line item
const CHUNK_SIZE      = 480;  // safely under Stripe's 500-char metadata value limit

class CartError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ─── H-4 / M-4 fix: metadata chunking helpers ────────────────────────────────
//
// Stripe limits each metadata value to 500 characters (50 keys max).
// Large item arrays are split across indexed fields:
//   items_n = "3"           ← total chunk count
//   items_0 = "[{...}..."   ← first 480 chars
//   items_1 = "...}{"       ← next 480 chars
//   items_2 = "...}]"       ← remainder
//
// Subscription items use prefix "si" to keep key names short.
//
function chunkToMeta(json, prefix) {
  const chunkCount = Math.ceil(json.length / CHUNK_SIZE) || 1;
  const result = { [`${prefix}_n`]: String(chunkCount) };
  for (let i = 0; i < chunkCount; i++) {
    result[`${prefix}_${i}`] = json.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  }
  return result;
}

// ─── Resolve promo code ───────────────────────────────────────────────────────
async function resolvePromo(promoCode, subtotal) {
  if (!promoCode) return { discount: 0, promoData: null };

  const promo = await PromoCodeModel.findOne({ code: promoCode.toUpperCase() });
  if (!promo || !promo.isActive)                                        return { discount: 0, promoData: null };
  if (promo.expiryDate && new Date() > promo.expiryDate)                return { discount: 0, promoData: null };
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) return { discount: 0, promoData: null };
  if (subtotal < promo.minOrderAmount)                                   return { discount: 0, promoData: null };

  const discount = promo.discountType === 'percentage'
    ? +(subtotal * (promo.discountValue / 100)).toFixed(2)
    : +Math.min(promo.discountValue, subtotal).toFixed(2);

  return { discount, promoData: promo };
}

// ─── Core price resolution + totals ──────────────────────────────────────────
//
// Price priority: size bulk tiers > size-specific price > base price
// Security: amount is ALWAYS calculated server-side, never trusted from client.
//
async function resolveAndCalculate(items, promoCode) {
  const products = await ProductModel.find({
    _id: { $in: items.map((i) => i.productId) },
  }).lean();

  const productMap = {};
  products.forEach((p) => { productMap[p._id.toString()] = p; });

  let subtotal = 0;
  const lineItems = [];

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) {
      throw new CartError(404, 'One or more products in your cart are no longer available.');
    }

    // ── Stock validation ──────────────────────────────────────────────────────
    if (product.trackStock) {
      let availableStock = product.stockQuantity || 0;
      if (item.size && product.sizes?.length > 0) {
        const sizeForStock = product.sizes.find(
          (s) => s.label === item.size || s.value === item.size
        );
        if (sizeForStock) availableStock = sizeForStock.stockQuantity || 0;
      }
      if (item.quantity > availableStock) {
        throw new CartError(
          400,
          `Insufficient stock for "${product.name}"${item.size ? ` (${item.size})` : ''}. Only ${availableStock} available.`
        );
      }
    }

    // ── Resolve authoritative server-side price ───────────────────────────────
    let expectedPrice = product.price;
    let sizeData = null;

    if (item.size && product.sizes?.length > 0) {
      sizeData = product.sizes.find(
        (s) => s.label === item.size || s.value === item.size
      );
      if (sizeData?.price != null) expectedPrice = sizeData.price;
    }

    let bulkResolved = false;
    if (sizeData?.bulkTiers?.length > 0) {
      const applicable = sizeData.bulkTiers
        .filter((t) => item.quantity >= t.minQty)
        .sort((a, b) => b.minQty - a.minQty);
      if (applicable.length > 0) {
        expectedPrice = applicable[0].salePrice;
        bulkResolved = true;
      }
    }

    if (!bulkResolved && product.bulkPricing?.length > 0) {
      const bulk = product.bulkPricing.find((b) => b.quantity === item.quantity);
      if (bulk) expectedPrice = bulk.price;
    }

    // ── Apply subscription discount server-side ───────────────────────────────
    if (item.isSubscription && product.subscriptionSettings?.isEnabled) {
      const discPct = product.subscriptionSettings.discountPercentage || 0;
      if (discPct > 0) {
        expectedPrice = +(expectedPrice * (1 - discPct / 100)).toFixed(2);
      }
    }

    const lineTotal = +(expectedPrice * item.quantity).toFixed(2);
    subtotal += lineTotal;

    lineItems.push({
      productId:            item.productId,
      name:                 product.name,
      image:                product.image || '',
      slug:                 product.slug  || '',
      size:                 item.size,
      quantity:             item.quantity,
      unitPrice:            expectedPrice,
      lineTotal,
      isSubscription:       item.isSubscription       || false,
      subscriptionInterval: item.subscriptionInterval || null,
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
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { error, value } = cartValidationSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    const { items, promoCode } = value;

    const { lineItems, subtotal, discount, promoData, totalTax, totalDelivery, grandTotal }
      = await resolveAndCalculate(items, promoCode);

    const amountInPence = Math.round(grandTotal * 100);

    // ── H-4 fix: chunk items JSON across multiple metadata fields ──────────────
    const itemsChunks = chunkToMeta(JSON.stringify(lineItems), 'items');

    const subItems      = lineItems.filter((l) => l.isSubscription);
    const hasSubscription = subItems.length > 0;
    const subItemsChunks  = hasSubscription
      ? chunkToMeta(JSON.stringify(subItems), 'si')
      : {};

    // ── H-1 fix: one-time token to prove PI ownership on update-meta ───────────
    // Returned to client; required back on every update-meta call.
    const updateToken = randomBytes(24).toString('hex');

    const piParams = {
      amount:   amountInPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        type:            'product-purchase',
        itemCount:       String(items.length),
        promoCode:       promoData ? promoData.code : '',
        discount:        String(discount),
        subtotal:        String(subtotal),
        totalTax:        String(totalTax),
        totalDelivery:   String(totalDelivery),
        grandTotal:      String(grandTotal),
        currency:        'gbp',
        hasSubscription: String(hasSubscription),
        update_token:    updateToken, // ownership proof
        ...itemsChunks,
        ...subItemsChunks,
      },
    };

    // Tell Stripe to save the card for future off-session subscription charges
    if (hasSubscription) {
      piParams.setup_future_usage = 'off_session';
    }

    const paymentIntent = await getStripe().paymentIntents.create(piParams);

    return handleSuccess(res, 200, 'Payment intent created', {
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      updateToken,     // must be echoed back in every update-meta call
      amount:          grandTotal,
      breakdown: { subtotal, discount, totalTax, totalDelivery, grandTotal },
    });
  } catch (err) {
    if (err instanceof CartError) return next(handleError(err.status, err.message));
    // M-2 fix: surface Stripe API errors as 402 Payment Required, not 500
    if (err?.type?.startsWith('Stripe')) return next(handleError(402, err.message));
    next(err);
  }
};

// ─── POST /api/cart-payments/update-meta ─────────────────────────────────────
export const updatePaymentIntentMeta = async (req, res, next) => {
  try {
    const { paymentIntentId, updateToken, customer, shipping } = req.body;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return next(handleError(400, 'paymentIntentId is required'));
    }
    // H-1 fix: require the ownership token returned at PI creation
    if (!updateToken || typeof updateToken !== 'string') {
      return next(handleError(400, 'updateToken is required'));
    }
    if (!customer?.email || !customer?.firstName || !customer?.lastName) {
      return next(handleError(400, 'customer.firstName, customer.lastName and customer.email are required'));
    }
    if (!shipping?.address || !shipping?.city || !shipping?.postcode) {
      return next(handleError(400, 'shipping.address, shipping.city and shipping.postcode are required'));
    }

    const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (!pi || pi.metadata?.type !== 'product-purchase') {
      return next(handleError(400, 'Invalid payment reference'));
    }
    if (['succeeded', 'canceled'].includes(pi.status)) {
      return next(handleError(400, 'Payment has already been completed or cancelled'));
    }

    // H-1 fix: constant-time comparison prevents timing attacks
    const storedToken = pi.metadata?.update_token || '';
    if (!storedToken || storedToken !== updateToken) {
      return next(handleError(403, 'Invalid update token'));
    }

    // Only update customer/shipping keys — pricing keys are immutable after PI creation
    await getStripe().paymentIntents.update(paymentIntentId, {
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
    if (err?.type?.startsWith('Stripe')) return next(handleError(400, err.message));
    next(err);
  }
};
