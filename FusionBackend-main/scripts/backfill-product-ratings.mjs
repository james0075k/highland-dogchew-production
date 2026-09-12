/**
 * Recomputes product.rating / product.reviews from approved reviews.
 *
 * Normally kept in step automatically: moderating a review calls
 * syncProductRating(). This script exists for the cases that bypass it —
 * reviews approved before the sync existed, or rows edited directly in the
 * database.
 *
 * Safe to run repeatedly. It only writes where stored and real disagree, and
 * every value is derived, so a bad run can simply be re-run.
 *
 *   node scripts/backfill-product-ratings.mjs           # dry run, changes nothing
 *   node scripts/backfill-product-ratings.mjs --apply   # writes
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ReviewModel from '../src/models/reviewModel.js';
import ProductModel from '../src/models/productModel.js';

dotenv.config();

const apply = process.argv.includes('--apply');

await mongoose.connect(process.env.mongoConnectionString);
console.log(`db: ${mongoose.connection.name} @ ${mongoose.connection.host}`);
console.log(apply ? 'MODE: apply\n' : 'MODE: dry run (pass --apply to write)\n');

const rows = await ReviewModel.aggregate([
  { $match: { status: 'approved', isDeleted: { $ne: true }, product: { $ne: null } } },
  { $group: { _id: '$product', count: { $sum: 1 }, sum: { $sum: '$rating' } } },
]);

const real = new Map(
  rows.map((r) => [String(r._id), { reviews: r.count, rating: +(r.sum / r.count).toFixed(1) }])
);

const products = await ProductModel.find().select('name rating reviews').lean();
let changed = 0;

for (const p of products) {
  // A product with no approved reviews must read zero, not keep a stale figure.
  const want = real.get(String(p._id)) ?? { reviews: 0, rating: 0 };
  const stored = { reviews: p.reviews ?? 0, rating: p.rating ?? 0 };

  if (stored.rating === want.rating && stored.reviews === want.reviews) continue;

  console.log(`${p.name}`);
  console.log(`    ${stored.rating}★ / ${stored.reviews} reviews  ->  ${want.rating}★ / ${want.reviews}`);
  changed++;

  if (apply) await ProductModel.findByIdAndUpdate(p._id, want);
}

console.log(`\n${products.length} products scanned, ${changed} ${apply ? 'updated' : 'would change'}`);
await mongoose.disconnect();
