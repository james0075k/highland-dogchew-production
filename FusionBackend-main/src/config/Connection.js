import mongoose from 'mongoose';
// Imported for its side effect of registering the model, so createIndexes below
// can never hit a MissingSchemaError depending on import order.
import SubscriptionModel from '../models/subscriptionModel.js';

// ─── Startup migration: paymentIntentId index ────────────────────────────────
//
// The Order schema used to declare `paymentIntentId: { unique: true, sparse: true }`,
// which created an index that treats `null` as a present indexed value. Free
// orders (no Stripe PI) wrote `null` and collided with each other.
//
// The schema now uses a partial-filter unique index (only enforced when the
// field is a non-empty string). Mongoose can't replace an existing index just
// because the schema definition changed — so on each startup we:
//   1. Unset any null/empty paymentIntentId fields on existing orders
//   2. Drop the legacy index if its options don't match the new partial filter
//   3. Let Mongoose's normal index sync rebuild the correct index
//
async function migratePaymentIntentIndex() {
  const orders = mongoose.connection.db.collection('orders');

  // 1. Clean up null / empty values that the old index treated as collisions.
  try {
    const result = await orders.updateMany(
      { $or: [{ paymentIntentId: null }, { paymentIntentId: '' }] },
      { $unset: { paymentIntentId: '' } },
    );
    if (result.modifiedCount > 0) {
      console.log(`[DB migration] Unset paymentIntentId on ${result.modifiedCount} order(s)`);
    }
  } catch (err) {
    console.warn('[DB migration] Could not clean null paymentIntentId values:', err.message);
  }

  // 2. Drop the legacy unique-sparse index so Mongoose can recreate it with
  //    the partial-filter options declared in orderModel.js.
  try {
    const existing = await orders.indexes();
    const legacy = existing.find((ix) => ix.name === 'paymentIntentId_1');
    if (legacy && !legacy.partialFilterExpression) {
      await orders.dropIndex('paymentIntentId_1');
      console.log('[DB migration] Dropped legacy paymentIntentId_1 index');
    }
  } catch (err) {
    if (err.codeName !== 'IndexNotFound') {
      console.warn('[DB migration] Could not drop legacy index:', err.message);
    }
  }
}

// ─── Startup migration: subscription origin keys ─────────────────────────────
//
// subscriptionModel.js now declares a unique index on
// { originPaymentIntentId, originItemKey } so the webhook and /orders/sync can
// never both insert a subscription for the same payment. Documents created
// before those fields existed have neither, so they are backfilled here from
// the first billingHistory entry — which is, by definition, the payment that
// created them.
//
// This function NEVER deletes or merges anything. If real duplicates exist the
// unique index build fails; we log loudly and carry on booting, because a
// billing record must only be consolidated by a human running
// scripts/auditDuplicateSubscriptions.js.
//
async function migrateSubscriptionOriginKeys() {
  const subs = mongoose.connection.db.collection('subscriptions');

  try {
    const pending = await subs.find(
      {
        $or: [
          { originPaymentIntentId: { $exists: false } },
          { originPaymentIntentId: '' },
          { originItemKey: { $exists: false } },
          { originItemKey: '' },
        ],
      },
      { projection: { billingHistory: 1, product: 1, productName: 1, size: 1 } },
    ).toArray();

    let filled = 0;
    for (const doc of pending) {
      const originPI = doc.billingHistory?.[0]?.paymentIntentId;
      if (!originPI) continue; // nothing authoritative to key on — leave unindexed

      const itemKey = `${doc.product ? String(doc.product) : (doc.productName || '')}::${doc.size || 'Default'}`;
      await subs.updateOne(
        { _id: doc._id },
        { $set: { originPaymentIntentId: originPI, originItemKey: itemKey } },
      );
      filled += 1;
    }

    if (filled > 0) {
      console.log(`[DB migration] Backfilled origin keys on ${filled} subscription(s)`);
    }
    const skipped = pending.length - filled;
    if (skipped > 0) {
      console.warn(
        `[DB migration] ${skipped} subscription(s) have no billingHistory PaymentIntent — ` +
        'left without an origin key, so the unique index does not cover them.',
      );
    }
  } catch (err) {
    console.warn('[DB migration] Subscription origin-key backfill failed:', err.message);
  }

  // createIndexes (not syncIndexes) — it only adds what's missing and never drops
  // an existing index. Called explicitly so a blocked build is reported here
  // rather than as a background index error that is easy to miss.
  try {
    await SubscriptionModel.createIndexes();
  } catch (err) {
    if (err.code === 11000 || /duplicate key/i.test(err.message)) {
      console.error(
        '[DB migration] ⚠️  Duplicate subscriptions block the uniqueness index — the same ' +
        'payment created more than one subscription record, so a customer may be billed twice. ' +
        'Run: node scripts/auditDuplicateSubscriptions.js',
      );
    } else {
      console.warn('[DB migration] Subscription index sync failed:', err.message);
    }
  }
}

const Connection = async () => {
  try {
    if (!process.env.mongoConnectionString) {
      console.error('[DB] Missing mongoConnectionString environment variable');
      process.exit(1);
    }
    await mongoose.connect(process.env.mongoConnectionString);
    console.log('[DB] Connected to MongoDB Atlas successfully');
    await migratePaymentIntentIndex();
    await migrateSubscriptionOriginKeys();
  } catch (err) {
    console.error('[DB] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

export default Connection;
