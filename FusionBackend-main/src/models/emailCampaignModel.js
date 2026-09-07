import mongoose from 'mongoose';

/**
 * Audit trail for every marketing send.
 *
 * Marketing email is the one thing here that reaches customers in bulk and
 * cannot be recalled, so "what exactly went out, to how many people, and who
 * pressed send" needs to be answerable afterwards — both for the admin's own
 * sanity and because a complaint under PECR asks precisely that.
 */
const emailCampaignSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['newsletter', 'review-request'],
      required: true,
    },
    subject: { type: String, default: '' },
    headline: { type: String, default: '' },

    // What the admin selected, kept verbatim so a send can be explained later.
    audience: {
      source:      { type: String, default: '' }, // subscribers | customers | both
      productType: { type: String, default: null },
      orderStatus: { type: String, default: null },
      dateFrom:    { type: Date, default: null },
      dateTo:      { type: Date, default: null },
    },

    recipientCount: { type: Number, default: 0 },
    sentCount:      { type: Number, default: 0 },
    failedCount:    { type: Number, default: 0 },
    suppressedCount:{ type: Number, default: 0 },

    status: {
      type: String,
      enum: ['sent', 'partial', 'failed', 'test'],
      default: 'sent',
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    sentByEmail: { type: String, default: '' },

    // Only the addresses that failed — a full recipient list would be a
    // needless second copy of the customer list sitting in another collection.
    failures: [{ email: String, error: String }],
  },
  { timestamps: true }
);

emailCampaignSchema.index({ createdAt: -1 });

const EmailCampaignModel = mongoose.model('EmailCampaign', emailCampaignSchema);

export default EmailCampaignModel;
