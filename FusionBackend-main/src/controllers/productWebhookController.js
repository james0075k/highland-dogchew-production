import Stripe from 'stripe';
import OrderModel from '../models/orderModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleProductWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.PRODUCT_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Product webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      // Only handle product purchases
      if (paymentIntent.metadata?.type !== 'product-purchase') break;

      try {
        // Update order to paid + confirmed
        const order = await OrderModel.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
          },
          { new: true }
        );

        if (order) {
          console.log(`Payment succeeded for order ${order.orderNumber}`);
        } else {
          console.log(`No order found for paymentIntent ${paymentIntent.id} — will be created by frontend`);
        }

        // Increment promo code usage if one was used
        const promoCode = paymentIntent.metadata?.promoCode;
        if (promoCode) {
          await PromoCodeModel.findOneAndUpdate(
            { code: promoCode },
            { $inc: { usageCount: 1 } }
          );
          console.log(`Promo code ${promoCode} usage incremented`);
        }
      } catch (err) {
        console.error('Error processing payment_intent.succeeded:', err.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object;

      if (failedIntent.metadata?.type !== 'product-purchase') break;

      try {
        await OrderModel.findOneAndUpdate(
          { paymentIntentId: failedIntent.id },
          {
            paymentStatus: 'failed',
            orderStatus: 'cancelled',
          }
        );
        console.log(`Payment failed for paymentIntent ${failedIntent.id}`);
      } catch (err) {
        console.error('Error processing payment_intent.payment_failed:', err.message);
      }
      break;
    }

    default:
      console.log(`Unhandled product webhook event: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
