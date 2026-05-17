// Diagnostic: prints the orders collection's indexes and counts of any docs
// that still have a null/empty paymentIntentId.
//
// Usage:   node scripts/diagnoseOrders.js

import 'dotenv/config';
import mongoose from 'mongoose';

await mongoose.connect(process.env.mongoConnectionString);
const orders = mongoose.connection.db.collection('orders');

console.log('\n=== Indexes on `orders` ===');
const indexes = await orders.indexes();
for (const ix of indexes) console.log(JSON.stringify(ix, null, 2));

console.log('\n=== Docs with paymentIntentId === null ===');
console.log(await orders.countDocuments({ paymentIntentId: null }));

console.log('\n=== Docs with paymentIntentId === "" ===');
console.log(await orders.countDocuments({ paymentIntentId: '' }));

console.log('\n=== Docs where paymentIntentId is missing ===');
console.log(await orders.countDocuments({ paymentIntentId: { $exists: false } }));

console.log('\n=== Last 3 orders (paymentIntentId + grandTotal) ===');
const recent = await orders.find({}, { projection: { paymentIntentId: 1, grandTotal: 1, orderNumber: 1 } })
  .sort({ _id: -1 }).limit(3).toArray();
console.log(JSON.stringify(recent, null, 2));

await mongoose.disconnect();
