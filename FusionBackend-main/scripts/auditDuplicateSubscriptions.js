/**
 * auditDuplicateSubscriptions.js
 *
 * Finds subscription records that were created twice for the SAME original
 * payment. This happens because both the Stripe webhook and POST /api/orders/sync
 * call createSubscriptionsFromPI, and its old guard was a read-then-write with no
 * unique index behind it — so two overlapping calls could both insert.
 *
 * A duplicate means the customer is billed twice on every renewal, so this must
 * be reviewed by a human before the unique index is applied.
 *
 * Usage:
 *   node scripts/auditDuplicateSubscriptions.js            # read-only report
 *   node scripts/auditDuplicateSubscriptions.js --merge     # merge duplicates
 *
 * --merge keeps the OLDEST document in each group, copies any billing history and
 * order references the newer duplicates hold into it, then marks the duplicates
 * cancelled with mergedInto set. Nothing is deleted.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MERGE = process.argv.includes('--merge');

if (!process.env.mongoConnectionString) {
  console.error('[audit] Missing mongoConnectionString environment variable');
  process.exit(1);
}

await mongoose.connect(process.env.mongoConnectionString);
const subs = mongoose.connection.db.collection('subscriptions');

// ─── The natural key ─────────────────────────────────────────────────────────
//
// Prefer originPaymentIntentId (written by createSubscriptionsFromPI once the
// migration has run); fall back to the first billingHistory entry, which is the
// payment that created the subscription for every pre-existing document.
//
const keyFields = {
  _piKey: {
    $cond: [
      {
        $and: [
          { $eq: [{ $type: '$originPaymentIntentId' }, 'string'] },
          { $gt: ['$originPaymentIntentId', ''] },
        ],
      },
      '$originPaymentIntentId',
      { $arrayElemAt: ['$billingHistory.paymentIntentId', 0] },
    ],
  },
  _itemKey: {
    $concat: [
      {
        $cond: [
          { $ifNull: ['$product', false] },
          { $toString: '$product' },
          { $ifNull: ['$productName', ''] },
        ],
      },
      '::',
      { $ifNull: ['$size', ''] },
    ],
  },
};

console.log('\n=== Indexes on `subscriptions` ===');
for (const ix of await subs.indexes()) {
  console.log(`  ${ix.name}  ${JSON.stringify(ix.key)}${ix.unique ? '  [unique]' : ''}`);
}

const total = await subs.countDocuments();
const missingOrigin = await subs.countDocuments({
  $or: [{ originPaymentIntentId: { $exists: false } }, { originPaymentIntentId: '' }],
});

console.log('\n=== Totals ===');
console.log(`  subscriptions:                 ${total}`);
console.log(`  awaiting origin-key backfill:  ${missingOrigin}`);

// ─── Duplicate groups ────────────────────────────────────────────────────────
const groups = await subs.aggregate([
  { $addFields: keyFields },
  { $match: { _piKey: { $type: 'string', $ne: '' } } },
  {
    $group: {
      _id:   { pi: '$_piKey', item: '$_itemKey' },
      count: { $sum: 1 },
      docs:  {
        $push: {
          _id:             '$_id',
          subscriptionId:  '$subscriptionId',
          email:           '$email',
          productName:     '$productName',
          size:            '$size',
          status:          '$status',
          createdAt:       '$createdAt',
          nextBillingDate: '$nextBillingDate',
          unitPrice:       '$unitPrice',
          quantity:        '$quantity',
          billingCount:    { $size: { $ifNull: ['$billingHistory', []] } },
          billingHistory:  { $ifNull: ['$billingHistory', []] },
          orders:          { $ifNull: ['$orders', []] },
          stripeCustomerId: '$stripeCustomerId',
        },
      },
    },
  },
  { $match: { count: { $gt: 1 } } },
  { $sort: { count: -1 } },
]).toArray();

console.log('\n=== Duplicate subscription groups ===');

if (groups.length === 0) {
  console.log('  None. Safe to apply the unique index.\n');
  await mongoose.disconnect();
  process.exit(0);
}

let activeDuplicates = 0;

for (const g of groups) {
  console.log(`\n  PI ${g._id.pi}  item ${g._id.item}  →  ${g.count} records`);
  const ordered = [...g.docs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  ordered.forEach((d, i) => {
    const active = d.status === 'active';
    if (active && i > 0) activeDuplicates += 1;
    console.log(
      `    ${i === 0 ? 'KEEP  ' : 'DUP   '} ${d.subscriptionId}  ${d.status.padEnd(14)}` +
      `  created ${new Date(d.createdAt).toISOString().slice(0, 16)}` +
      `  next ${d.nextBillingDate ? new Date(d.nextBillingDate).toISOString().slice(0, 10) : '—'}` +
      `  £${d.unitPrice} ×${d.quantity}  billings ${d.billingCount}  ${d.email}`
    );
  });
}

console.log(
  `\n  ${groups.length} duplicate group(s); ${activeDuplicates} extra record(s) still ACTIVE ` +
  `and therefore billing again.`
);

// ─── Optional merge ──────────────────────────────────────────────────────────
if (!MERGE) {
  console.log('\n  Read-only run. Re-run with --merge to consolidate them.\n');
  await mongoose.disconnect();
  process.exit(1); // non-zero so a caller can tell duplicates exist
}

console.log('\n=== Merging ===');

for (const g of groups) {
  const ordered = [...g.docs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const keeper  = ordered[0];
  const losers  = ordered.slice(1);

  // Only carry across billing entries the keeper doesn't already have. A billing
  // entry is identified by its PaymentIntent — that is what a charge actually is.
  const keeperPIs = new Set((keeper.billingHistory || []).map((b) => b.paymentIntentId).filter(Boolean));
  const extraBillings = [];
  const extraOrders   = [];

  for (const loser of losers) {
    for (const b of loser.billingHistory || []) {
      if (b.paymentIntentId && !keeperPIs.has(b.paymentIntentId)) {
        keeperPIs.add(b.paymentIntentId);
        extraBillings.push(b);
      }
    }
    for (const o of loser.orders || []) extraOrders.push(o);
  }

  if (extraBillings.length > 0 || extraOrders.length > 0) {
    await subs.updateOne(
      { _id: keeper._id },
      {
        ...(extraBillings.length > 0 && { $push: { billingHistory: { $each: extraBillings } } }),
        ...(extraOrders.length   > 0 && { $addToSet: { orders: { $each: extraOrders } } }),
      }
    );
  }

  for (const loser of losers) {
    await subs.updateOne(
      { _id: loser._id },
      {
        $set: {
          status:     'cancelled',
          mergedInto: keeper.subscriptionId,
          mergedAt:   new Date(),
        },
      }
    );
    console.log(`  ${loser.subscriptionId} → cancelled, merged into ${keeper.subscriptionId}`);
  }

  console.log(
    `  ${keeper.subscriptionId} kept` +
    `${extraBillings.length ? ` (+${extraBillings.length} billing entr${extraBillings.length === 1 ? 'y' : 'ies'})` : ''}` +
    `${extraOrders.length ? ` (+${extraOrders.length} order ref(s))` : ''}`
  );
}

console.log('\n  Merge complete. Re-run without --merge to confirm, then restart the API so the');
console.log('  unique index can be created.\n');

await mongoose.disconnect();
