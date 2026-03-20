import { Router } from 'express';
import { triggerSubscriptionProcess } from '../controllers/subscriptionProcessController.js';
import SubscriptionModel from '../models/subscriptionModel.js';

const subscriptionProcessRoute = Router();

// POST /api/subscriptions/process — manual cron trigger (protected by x-cron-secret header)
subscriptionProcessRoute.post('/process', triggerSubscriptionProcess);

// ─── POST /api/subscriptions/lookup ──────────────────────────────────────────
// Public: find subscriptions by email — customer-facing
subscriptionProcessRoute.post('/lookup', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const subs = await SubscriptionModel.find({ email: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .select('-stripeCustomerId -paymentMethodId')
      .lean();

    return res.status(200).json({ success: true, data: { subscriptions: subs } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to look up subscriptions' });
  }
});

// ─── PATCH /api/subscriptions/:subscriptionId/cancel ─────────────────────────
// Public: cancel a subscription — requires matching email for verification
subscriptionProcessRoute.patch('/:subscriptionId/cancel', async (req, res) => {
  const { subscriptionId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required to verify ownership' });
  }

  try {
    const sub = await SubscriptionModel.findOne({ subscriptionId });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    if (sub.email !== email.trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Email does not match subscription' });
    }
    if (sub.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Subscription is already cancelled' });
    }

    sub.status = 'cancelled';
    await sub.save();

    return res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
});

// ─── PATCH /api/subscriptions/:subscriptionId/pause ──────────────────────────
subscriptionProcessRoute.patch('/:subscriptionId/pause', async (req, res) => {
  const { subscriptionId } = req.params;
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const sub = await SubscriptionModel.findOne({ subscriptionId });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    if (sub.email !== email.trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Email does not match subscription' });
    }
    if (sub.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active subscriptions can be paused' });
    }

    sub.status = 'paused';
    await sub.save();
    return res.status(200).json({ success: true, message: 'Subscription paused' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to pause subscription' });
  }
});

// ─── PATCH /api/subscriptions/:subscriptionId/resume ─────────────────────────
subscriptionProcessRoute.patch('/:subscriptionId/resume', async (req, res) => {
  const { subscriptionId } = req.params;
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const sub = await SubscriptionModel.findOne({ subscriptionId });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
    if (sub.email !== email.trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Email does not match subscription' });
    }
    if (sub.status !== 'paused') {
      return res.status(400).json({ success: false, message: 'Only paused subscriptions can be resumed' });
    }

    sub.status = 'active';
    await sub.save();
    return res.status(200).json({ success: true, message: 'Subscription resumed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to resume subscription' });
  }
});

export default subscriptionProcessRoute;
