import Stripe from 'stripe';
import ProductModel from '../models/productModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { cartValidationSchema } from '../validations/cartValidationSchema.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TAX_RATE        = 0.20;  // 20% VAT
const DELIVERY_CHARGE = 2.99;  // per unique line item

class CartError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
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
// Price priority: bulkPricing > size-specific > base price > subscription discount
// Security: charge is ALWAYS calculated here, never taken from client.
//
async function resolveAndCalculate(items, promoCode) {
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

    // ── Stock validation ───────────────────────────────────────────────────
    if (product.trackStock) {
      let availableStock = product.stockQuantity || 0;
      if (item.size && product.sizes?.length > 0) {
        const sizeForStock = product.sizes.find(
          (s) => s.label === item.size || s.value === item.size
        );
        if (sizeForStock) availableStock = sizeForStock.stockQuantity || 0;
      }
      if (item.quantity > availableStock) {
        throw new CartError(400, `Insufficient stock for "${product.name}"${item.size ? ` (${item.size})` : ''}. Only ${availableStock} available.`);
      }
    }

    // ── Resolve authoritative server-side price ──────────────────────────────
    let expectedPrice = product.price; // base fallback
    let sizeData = null;

    if (item.size && product.sizes?.length > 0) {
      sizeData = product.sizes.find(
        (s) => s.label === item.size || s.value === item.size
      );
      if (sizeData?.price != null) expectedPrice = sizeData.price;
    }

    // Size-specific bulk tiers take priority
    let bulkResolved = false;
    if (sizeData?.bulkTiers?.length > 0) {
      // Find the highest minQty tier where item.quantity >= tier.minQty
      const applicable = sizeData.bulkTiers
        .filter((t) => item.quantity >= t.minQty)
        .sort((a, b) => b.minQty - a.minQty);
      if (applicable.length > 0) {
        expectedPrice = applicable[0].salePrice;
        bulkResolved = true;
      }
    }

    // Fall back to global bulkPricing exact-match (backward compat)
    if (!bulkResolved && product.bulkPricing?.length > 0) {
      const bulk = product.bulkPricing.find((b) => b.quantity === item.quantity);
      if (bulk) expectedPrice = bulk.price;
    }

    // ── Apply subscription discount server-side ──────────────────────────────
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

    // Serialize line items for webhook metadata (max 500 chars per field)
    const fullItemsJson    = JSON.stringify(lineItems);
    const compactItemsJson = JSON.stringify(
      lineItems.map((l) => ({
        name: l.name, size: l.size, quantity: l.quantity,
        unitPrice: l.unitPrice, lineTotal: l.lineTotal,
      }))
    );
    const itemsMeta = fullItemsJson.length <= 490 ? fullItemsJson : compactItemsJson;

    // Subscription-specific items (for webhook to create subscription records)
    const subItems      = lineItems.filter((l) => l.isSubscription);
    const hasSubscription = subItems.length > 0;
    const subItemsJson  = hasSubscription ? JSON.stringify(subItems) : '';

    const piParams = {
      amount:   amountInPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        type:             'product-purchase',
        itemCount:        items.length.toString(),
        items:            itemsMeta,
        promoCode:        promoData ? promoData.code : '',
        discount:         discount.toString(),
        subtotal:         subtotal.toString(),
        totalTax:         totalTax.toString(),
        totalDelivery:    totalDelivery.toString(),
        grandTotal:       grandTotal.toString(),
        currency:         'gbp',
        hasSubscription:  hasSubscription.toString(),
        subscriptionItems: subItemsJson.slice(0, 490), // Stripe 500-char limit
      },
    };

    // Tell Stripe to save the card for future off-session charges
    if (hasSubscription) {
      piParams.setup_future_usage = 'off_session';
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    return handleSuccess(res, 200, 'Payment intent created', {
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount:          grandTotal,
      breakdown: { subtotal, discount, totalTax, totalDelivery, grandTotal },
    });
  } catch (err) {
    if (err instanceof CartError) return next(handleError(err.status, err.message));
    next(err);
  }
};

// ─── POST /api/cart-payments/update-meta ─────────────────────────────────────
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

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi || pi.metadata?.type !== 'product-purchase') {
      return next(handleError(400, 'Invalid payment reference'));
    }
    if (['succeeded', 'canceled'].includes(pi.status)) {
      return next(handleError(400, 'Payment has already been completed or cancelled'));
    }

    // Only update customer/shipping keys — never touch pricing keys
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
    if (err.type?.startsWith('Stripe')) return next(handleError(400, err.message));
    next(err);
  }
};
