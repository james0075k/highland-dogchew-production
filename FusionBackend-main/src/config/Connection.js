import mongoose from 'mongoose';

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

const Connection = async () => {
  try {
    if (!process.env.mongoConnectionString) {
      console.error('[DB] Missing mongoConnectionString environment variable');
      process.exit(1);
    }
    await mongoose.connect(process.env.mongoConnectionString);
    console.log('[DB] Connected to MongoDB Atlas successfully');
    await migratePaymentIntentIndex();
  } catch (err) {
    console.error('[DB] Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

export default Connection;
