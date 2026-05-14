import OrderModel from '../models/orderModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'backordered', 'processing', 'shipped', 'delivered', 'cancelled'];

// â”€â”€â”€ GET /api/admin/orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Returns all orders, newest first, with full details.
// Supports query params: ?page=1&limit=20&paymentStatus=paid&orderStatus=confirmed
export const getAllOrders = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip   = (page - 1) * limit;

    const filter = {};
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.orderStatus)   filter.orderStatus   = req.query.orderStatus;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    return handleSuccess(res, 200, 'Orders fetched successfully', {
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€ GET /api/admin/orders/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getOrderById = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.id).lean();
    if (!order) return next(handleError(404, 'Order not found'));
    return handleSuccess(res, 200, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€ PATCH /api/admin/orders/:id/status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Admin can update the delivery / order status (e.g. confirmed â†’ shipped).
// When status is "shipped", optionally accepts trackingNumber.
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    if (!orderStatus || !VALID_ORDER_STATUSES.includes(orderStatus)) {
      return next(
        handleError(400, `orderStatus must be one of: ${VALID_ORDER_STATUSES.join(', ')}`)
      );
    }

    const update = { orderStatus };

    if (orderStatus === 'shipped') {
      if (trackingNumber !== undefined && trackingNumber !== null) {
        const tn = String(trackingNumber).trim();
        if (tn && !/^[A-Za-z0-9\-]{4,50}$/.test(tn)) {
          return next(handleError(400, 'Invalid tracking number format'));
        }
        if (tn) {
          update.trackingNumber = tn.toUpperCase();
          update.courier = 'evri';
          update.shippedAt = new Date();
        }
      }
    }

    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!order) return next(handleError(404, 'Order not found'));

    return handleSuccess(res, 200, 'Order status updated', order);
  } catch (err) {
    next(err);
  }
};

// â”€â”€â”€ GET /api/admin/orders/stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Quick summary stats for the admin dashboard header.
export const getOrderStats = async (req, res, next) => {
  try {
    const [total, paid, pending, shipped] = await Promise.all([
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ paymentStatus: 'paid' }),
      OrderModel.countDocuments({ orderStatus: 'pending' }),
      OrderModel.countDocuments({ orderStatus: 'shipped' }),
    ]);

    const revenueAgg = await OrderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;

    return handleSuccess(res, 200, 'Stats fetched', {
      totalOrders:   total,
      paidOrders:    paid,
      pendingOrders: pending,
      shippedOrders: shipped,
      totalRevenue:  +totalRevenue.toFixed(2),
    });
  } catch (err) {
    next(err);
  }
};
