/**
 * One-time backfill script: sets productType='yak-milk' on any product
 * that is missing the productType field.
 *
 * Usage:  node scripts/backfill-productType.js
 *
 * Safe to run multiple times — only touches docs where productType is null/missing.
 * Delete this file after confirming the fix.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/fusion';

async function backfill() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Find products missing productType
    const missing = await collection.countDocuments({
      $or: [
        { productType: { $exists: false } },
        { productType: null },
        { productType: '' },
      ],
    });

    console.log(`Found ${missing} products missing productType`);

    if (missing > 0) {
      const result = await collection.updateMany(
        {
          $or: [
            { productType: { $exists: false } },
            { productType: null },
            { productType: '' },
          ],
        },
        { $set: { productType: 'yak-milk' } }
      );
      console.log(`Updated ${result.modifiedCount} products → productType: "yak-milk"`);
    }

    // Show summary of all products by type
    const summary = await collection.aggregate([
      { $group: { _id: '$productType', count: { $sum: 1 } } },
    ]).toArray();
    console.log('\nProducts by type:');
    summary.forEach((s) => console.log(`  ${s._id}: ${s.count}`));

    await mongoose.disconnect();
    console.log('\nDone. Disconnected.');
  } catch (err) {
    console.error('Backfill error:', err);
    process.exit(1);
  }
}

backfill();
