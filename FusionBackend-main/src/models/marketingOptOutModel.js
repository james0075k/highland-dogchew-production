import mongoose from 'mongoose';

/**
 * Who must never receive marketing email again.
 *
 * Why this is separate from Subscriber.isActive: a customer who bought a chew
 * but never joined the newsletter has no Subscriber row at all, so there is
 * nowhere on that model to record their objection. Marketing sends draw from
 * both the subscriber list and the order history, so the suppression list has
 * to cover any address, subscriber or not.
 *
 * `scope` lets someone stop the promotional newsletter while still receiving a
 * review request for something they actually bought (and vice versa). 'all'
 * suppresses both.
 */
const marketingOptOutSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ['all', 'newsletter', 'review'],
      default: 'all',
    },
    reason: {
      type: String,
      enum: ['unsubscribed', 'bounced', 'complaint', 'manual'],
      default: 'unsubscribed',
    },
  },
  { timestamps: true }
);

// One row per address per scope — re-clicking an unsubscribe link must be a
// no-op, not a duplicate.
marketingOptOutSchema.index({ email: 1, scope: 1 }, { unique: true });

const MarketingOptOutModel = mongoose.model('MarketingOptOut', marketingOptOutSchema);

export default MarketingOptOutModel;
