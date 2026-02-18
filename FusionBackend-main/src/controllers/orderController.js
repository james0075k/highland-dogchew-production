import OrderModel from '../models/orderModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

// POST /api/orders/create
export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      totalTax,
      totalDelivery,
      totalDiscount,
      grandTotal,
      paymentIntentId,
    } = req.body;

    // Duplicate prevention — if order already exists for this paymentIntentId, return it
    if (paymentIntentId) {
      const existing = await OrderModel.findOne({ paymentIntentId });
      if (existing) {
        return handleSuccess(res, 200, 'Order already exists', existing);
      }
    }

    const order = await OrderModel.create({
      items,
      shippingAddress,
      subtotal,
      totalTax,
      totalDelivery,
      totalDiscount: totalDiscount || 0,
      grandTotal,
      paymentIntentId,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    return handleSuccess(res, 201, 'Order created successfully', order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/payment-intent/:paymentIntentId
export const getOrderByPaymentIntent = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;

    const order = await OrderModel.findOne({ paymentIntentId });
    if (!order) {
      return next(handleError(404, 'Order not found'));
    }

    return handleSuccess(res, 200, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/user — list orders for authenticated user (future)
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(50);
    return handleSuccess(res, 200, 'Orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};
