import Stripe from 'stripe';
import BookingModel from '../models/bookingModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import tourPackageModel from '../models/tourPackageModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    // Find booking and populate tour package details
    const booking = await BookingModel.findById(bookingId).populate('tourPackage');
    if (!booking) {
      return next(handleError(404, 'Booking not found'));
    }

    const tourPackage = booking.tourPackage;
    if (!tourPackage) {
      return next(handleError(404, 'Tour package not found'));
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: booking.guestInfo.email,
      line_items: [
        {
          price_data: {
            currency: tourPackage.currency || 'usd',
            product_data: {
              name: tourPackage.title,
              description: `${tourPackage.location.city}, ${tourPackage.location.country} - ${tourPackage.duration.days}D/${tourPackage.duration.nights}N`,
              images: tourPackage.gallery ? [tourPackage.gallery[0]] : [],
            },
            unit_amount: Math.round(booking.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        bookingId: booking._id.toString(),
        tourPackageId: tourPackage._id.toString(),
        customerEmail: booking.guestInfo.email,
        customerName: booking.guestInfo.name,
      },
       success_url: `http://localhost:3000/payment-success?bookingId=${booking._id}&sessionId={CHECKOUT_SESSION_ID}`,
  cancel_url: `http://localhost:3000/payment-cancel?bookingId=${booking._id}`,  
    });

    await BookingModel.findByIdAndUpdate(bookingId, {
      stripeSessionId: session.id,
      paymentStatus: 'processing'
    });

    return handleSuccess(res, 200, 'Checkout session created successfully', { 
      sessionId: session.id,
      checkoutUrl: session.url 
    });
  } catch (err) {
    console.error("Stripe Checkout Error:", err.message);
    return next(handleError(500, `Failed to create Stripe session: ${err.message}`));
  }
};

export const stripeWebhookHandler = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      try {
        // Update booking status
        const updatedBooking = await BookingModel.findByIdAndUpdate(
          bookingId,
          {
            paymentStatus: 'paid',
            status: 'confirmed',
            stripePaymentIntentId: session.payment_intent,
            paidAt: new Date()
          },
          { new: true }
        ).populate('tourPackage');

        console.log(`✅ Payment successful for booking ${bookingId}`);
        console.log(`Tour Package: ${updatedBooking.tourPackage.title}`);
        
        // Here you can add additional logic like:
        // - Send confirmation email
        // - Update inventory
        // - Notify tour operators
        
      } catch (err) {
        console.error(`❌ Failed to update booking after payment: ${err.message}`);
      }
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      const expiredBookingId = expiredSession.metadata.bookingId;
      
      try {
        await BookingModel.findByIdAndUpdate(expiredBookingId, {
          paymentStatus: 'failed',
          status: 'expired'
        });
        console.log(`⏰ Payment session expired for booking ${expiredBookingId}`);
      } catch (err) {
        console.error(`❌ Failed to update expired booking: ${err.message}`);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`❌ Payment failed: ${failedPayment.id}`);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send({ received: true });
};

// Get payment status for a booking
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await BookingModel.findById(bookingId)
      .populate('tourPackage')
      .select('paymentStatus status totalAmount paidAt stripeSessionId');
    
    if (!booking) {
      return next(handleError(404, 'Booking not found'));
    }

    return handleSuccess(res, 200, 'Payment status fetched successfully', booking);
  } catch (err) {
    return next(handleError(500, `Failed to fetch payment status: ${err.message}`));
  }
};

// Refund payment
export const refundPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason } = req.body;

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return next(handleError(404, 'Booking not found'));
    }

    if (booking.paymentStatus !== 'paid') {
      return next(handleError(400, 'Cannot refund unpaid booking'));
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer',
      metadata: {
        bookingId: bookingId,
        refundReason: reason || 'Customer request'
      }
    });

    // Update booking status
    await BookingModel.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      refundId: refund.id,
      refundedAt: new Date(),
      refundAmount: refund.amount / 100
    });

    return handleSuccess(res, 200, 'Refund processed successfully', {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    });
  } catch (err) {
    console.error("Refund Error:", err.message);
    return next(handleError(500, `Failed to process refund: ${err.message}`));
  }
};