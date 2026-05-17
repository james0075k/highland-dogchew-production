// One-off cleanup for the paymentIntentId unique-index problem.
//
// 1. Drops the old `paymentIntentId_1` unique-sparse index (which incorrectly
//    treats null as a present indexed value, blocking multiple free orders).
// 2. Unsets paymentIntentId on any order docs where it's null or empty string.
// 3. Lets Mongoose rebuild the new partial-filter unique index on next startup.
//
// Usage:   node scripts/cleanupNullPaymentIntent.js

import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.mongoConnectionString;
if (!uri) {
  console.error('mongoConnectionString missing from .env');
  process.exit(1);
}

await mongoose.connect(uri);
const orders = mongoose.connection.db.collection('orders');

// 1. Drop the legacy unique-sparse index, if it exists.
try {
  await orders.dropIndex('paymentIntentId_1');
  console.log('Dropped legacy index paymentIntentId_1');
} catch (err) {
  if (err.codeName === 'IndexNotFound') {
    console.log('Legacy index paymentIntentId_1 not present — skipping');
  } else {
    throw err;
  }
}

// 2. Remove null / empty paymentIntentId values from existing docs.
const result = await orders.updateMany(
  { $or: [{ paymentIntentId: null }, { paymentIntentId: '' }] },
  { $unset: { paymentIntentId: '' } },
);
console.log(`Cleaned ${result.modifiedCount} order doc(s).`);

await mongoose.disconnect();
console.log('Done. Restart the backend — Mongoose will create the new partial-filter index automatically.');
