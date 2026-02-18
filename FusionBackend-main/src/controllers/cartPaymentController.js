import Stripe from 'stripe';
import ProductModel from '../models/productModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { cartValidationSchema } from '../validations/cartValidationSchema.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TAX_RATE = 0.20;        // 20% VAT
const DELIVERY_PER_ITEM = 2.99;

// Helper: validate and calculate promo discount
async function resolvePromo(promoCode, subtotal) {
  if (!promoCode) return { discount: 0, promoData: null };

  const promo = await PromoCodeModel.findOne({ code: promoCode.toUpperCase() });

  if (!promo || !promo.isActive) return { discount: 0, promoData: null };
  if (promo.expiryDate && new Date() > promo.expiryDate) return { discount: 0, promoData: null };
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) return { discount: 0, promoData: null };
  if (subtotal < promo.minOrderAmount) return { discount: 0, promoData: null };

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = +(subtotal * (promo.discountValue / 100)).toFixed(2);
  } else {
    discount = +Math.min(promo.discountValue, subtotal).toFixed(2);
  }

  return { discount, promoData: promo };
}

// POST /api/cart-payments/validate
// Server-side price validation — never trust frontend prices
export const validateCart = async (req, res, next) => {
  try {
    // Joi validation
    const { error, value } = cartValidationSchema.validate(req.body);
    if (error) {
      return next(handleError(400, error.details[0].message));
    }

    const { items, promoCode } = value;

    // Fetch all products in one query
    const productIds = items.map((i) => i.productId);
    const products = await ProductModel.find({ _id: { $in: productIds } }).lean();

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const validated = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return next(handleError(404, `Product ${item.productId} not found`));
      }

      // Find matching bulk price or use base price
      let expectedPrice = product.price;
      if (product.bulkPricing && product.bulkPricing.length > 0) {
        const bulk = product.bulkPricing.find((b) => b.quantity === item.quantity);
        if (bulk) {
          expectedPrice = bulk.price;
        }
      }

      // Compare frontend price against server price (allow small float tolerance)
      if (Math.abs(expectedPrice - item.unitPrice) > 0.01) {
        return next(
          handleError(400, `Price mismatch for "${product.name}". Expected £${expectedPrice.toFixed(2)}, got £${item.unitPrice.toFixed(2)}. Please refresh the page.`)
        );
      }

      const lineTotal = expectedPrice * item.quantity;
      subtotal += lineTotal;

      validated.push({
        productId: item.productId,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice: expectedPrice,
        lineTotal: +lineTotal.toFixed(2),
      });
    }

    subtotal = +subtotal.toFixed(2);

    // Apply promo code discount
    const { discount } = await resolvePromo(promoCode, subtotal);
    const discountedSubtotal = +(subtotal - discount).toFixed(2);

    const totalTax = +(discountedSubtotal * TAX_RATE).toFixed(2);
    const totalDelivery = +(items.length * DELIVERY_PER_ITEM).toFixed(2);
    const grandTotal = +(discountedSubtotal + totalTax + totalDelivery).toFixed(2);

    return handleSuccess(res, 200, 'Cart validated successfully', {
      items: validated,
      subtotal,
      discount,
      totalTax,
      totalDelivery,
      grandTotal,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart-payments/create-payment-intent
export const createPaymentIntent = async (req, res, next) => {
  try {
    // Joi validation
    const { error, value } = cartValidationSchema.validate(req.body);
    if (error) {
      return next(handleError(400, error.details[0].message));
    }

    const { items, promoCode } = value;

    // Re-validate prices server-side (same logic)
    const productIds = items.map((i) => i.productId);
    const products = await ProductModel.find({ _id: { $in: productIds } }).lean();

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return next(handleError(404, `Product ${item.productId} not found`));
      }

      let expectedPrice = product.price;
      if (product.bulkPricing && product.bulkPricing.length > 0) {
        const bulk = product.bulkPricing.find((b) => b.quantity === item.quantity);
        if (bulk) expectedPrice = bulk.price;
      }

      if (Math.abs(expectedPrice - item.unitPrice) > 0.01) {
        return next(
          handleError(400, `Price mismatch for "${product.name}". Please refresh the page.`)
        );
      }

      const lineTotal = expectedPrice * item.quantity;
      subtotal += lineTotal;

      lineItems.push({
        productId: item.productId,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice: expectedPrice,
        lineTotal: +lineTotal.toFixed(2),
      });
    }

    subtotal = +subtotal.toFixed(2);

    // Apply promo code discount
    const { discount, promoData } = await resolvePromo(promoCode, subtotal);
    const discountedSubtotal = +(subtotal - discount).toFixed(2);

    const totalTax = +(discountedSubtotal * TAX_RATE).toFixed(2);
    const totalDelivery = +(items.length * DELIVERY_PER_ITEM).toFixed(2);
    const grandTotal = +(discountedSubtotal + totalTax + totalDelivery).toFixed(2);

    // Amount in pence for Stripe
    const amountInPence = Math.round(grandTotal * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      metadata: {
        type: 'product-purchase',
        itemCount: items.length.toString(),
        items: JSON.stringify(lineItems.map((l) => `${l.name} x${l.quantity}`)),
        promoCode: promoData ? promoData.code : '',
        discount: discount.toString(),
      },
    });

    return handleSuccess(res, 200, 'Payment intent created', {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: grandTotal,
      breakdown: {
        subtotal,
        discount,
        totalTax,
        totalDelivery,
        grandTotal,
      },
    });
  } catch (err) {
    next(err);
  }
};
