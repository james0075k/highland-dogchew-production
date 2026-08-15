/**
 * wipeTestOrders.js
 *
 * Resets the shop's transactional data back to zero: every order, every
 * subscription, and the redemption counters on every promo code. Use this once,
 * at the end of the testing phase, so the dashboard starts from £0 / 0 orders.
 *
 * What this touches (and nothing else):
 *   orders        — dropped   (this is what the Revenue panel and Orders page read)
 *   subscriptions — dropped   (cancelled first, see below)
 *   promocodes    — usageCount / redeemedEmails / redeemedIPs reset, codes kept
 *
 * Products, varieties, reviews, testimonials, contact messages and admin users
 * are NOT touched.
 *
 * Order of operations matters. Subscriptions are set to `cancelled` BEFORE
 * anything is dropped, because the daily cron in subscriptionProcessController
 * charges saved cards off-session for every `active` subscription that is due.
 * Disarming first means a crash halfway through this script can never leave a
 * live subscription behind that keeps billing real customers.
 *
 * Usage:
 *   node scripts/wipeTestOrders.js                  # dry run — reports, changes nothing
 *   node scripts/wipeTestOrders.js --confirm        # export a backup, then wipe
 *   node scripts/wipeTestOrders.js --confirm --orders-only
 *                                                   # reset orders + revenue only
 *   node scripts/wipeTestOrders.js --confirm --stripe
 *                                                   # also detach the saved cards in Stripe
 *
 * Flags:
 *   --confirm      Required to write anything. Without it this is read-only.
 *   --orders-only  Drop `orders` and nothing else. Subscriptions and promo counters
 *                  are left exactly as they are. This is enough to zero the Revenue
 *                  panel and the Orders page, since both read only `orders`. Note
 *                  that surviving subscriptions keep references to the deleted
 *                  orders, and any still-active one will bill again on schedule.
 *   --stripe       Detach each subscription's saved payment method in Stripe, so
 *                  the card cannot be charged even by a stray API call. Customers
 *                  are left in place (Stripe deletions are irreversible) and their
 *                  ids are printed for manual review.
 *   --keep-promos  Leave promo code usage counters alone.
 *   --skip-export  Skip the JSON backup. Not recommended — the export is the only
 *                  copy of the customer names, addresses and phone numbers once
 *                  the collections are dropped.
 *
 * The backup lands in backups/wipe-<timestamp>/ as plain JSON arrays. To restore:
 *   mongoimport --uri "$mongoConnectionString" --collection orders --jsonArray \
 *     --file backups/wipe-<timestamp>/orders.json
 *
 * NOTE: this script talks to whatever mongoConnectionString points at in .env,
 * which is the live Atlas cluster — the same database production uses. There is
 * no separate test database. Read the target it prints before typing --confirm.
 */

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const CONFIRM     = process.argv.includes('--confirm');
const ORDERS_ONLY = process.argv.includes('--orders-only');
const SKIP_EXPORT = process.argv.includes('--skip-export');
// --orders-only means exactly that: subscriptions and promo codes are off limits,
// so it implies --keep-promos and rules out the Stripe card detach.
const WITH_STRIPE = process.argv.includes('--stripe') && !ORDERS_ONLY;
const KEEP_PROMOS = process.argv.includes('--keep-promos') || ORDERS_ONLY;

const TARGETS = ORDERS_ONLY ? ['orders'] : ['orders', 'subscriptions'];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.mongoConnectionString) {
  console.error('[wipe] Missing mongoConnectionString environment variable');
  process.exit(1);
}

await mongoose.connect(process.env.mongoConnectionString);

const db      = mongoose.connection.db;
const orders  = db.collection('orders');
const subs    = db.collection('subscriptions');
const promos  = db.collection('promocodes');

// ─── 1. Report what is actually there ────────────────────────────────────────

const [orderCount, paidCount, subCount, activeSubCount] = await Promise.all([
  orders.countDocuments(),
  orders.countDocuments({ paymentStatus: 'paid' }),
  subs.countDocuments(),
  subs.countDocuments({ status: 'active' }),
]);

const revenueAgg = await orders
  .aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } },
  ])
  .toArray();
const revenue = revenueAgg[0]?.total ?? 0;

const promosWithUsage = await promos.countDocuments({
  $or: [
    { usageCount: { $gt: 0 } },
    { redeemedEmails: { $exists: true, $not: { $size: 0 } } },
    { redeemedIPs: { $exists: true, $not: { $size: 0 } } },
  ],
});

console.log('');
console.log('  Target host      ', mongoose.connection.host);
console.log('  Target database  ', mongoose.connection.name);
console.log('');
console.log('  orders            ', orderCount, `(${paidCount} paid, £${revenue.toFixed(2)} revenue)`);
console.log('  subscriptions     ', subCount, `(${activeSubCount} active)`);
console.log('  promo codes used  ', promosWithUsage);
console.log('');

if (orderCount === 0 && subCount === 0 && promosWithUsage === 0) {
  console.log('[wipe] Nothing to do — already at zero.');
  await mongoose.disconnect();
  process.exit(0);
}

console.log(ORDERS_ONLY
  ? '  Scope              orders only — subscriptions and promo codes untouched'
  : '  Scope              orders + subscriptions + promo counters');
console.log('');

if (!CONFIRM) {
  console.log('[wipe] DRY RUN — nothing was changed.');
  console.log('[wipe] Re-run with --confirm to export a backup and wipe the above.');
  if (activeSubCount > 0 && !ORDERS_ONLY) {
    console.log(`[wipe] Note: ${activeSubCount} subscription(s) are active and would be`);
    console.log('       cancelled first, so the renewal cron stops charging those cards.');
  }
  await mongoose.disconnect();
  process.exit(0);
}

// ─── 2. Export a backup before destroying anything ───────────────────────────

if (SKIP_EXPORT) {
  console.log('[wipe] --skip-export set — no backup will be written.');
} else {
  const stamp  = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = path.join(ROOT, 'backups', `wipe-${stamp}`);
  await fs.mkdir(outDir, { recursive: true });

  // Back up everything this run is allowed to modify.
  const toExport = [['orders', orders]];
  if (!ORDERS_ONLY) toExport.push(['subscriptions', subs]);
  if (!KEEP_PROMOS) toExport.push(['promocodes', promos]);

  for (const [name, col] of toExport) {
    const docs = await col.find({}).toArray();
    await fs.writeFile(path.join(outDir, `${name}.json`), JSON.stringify(docs, null, 2), 'utf8');
    console.log(`[wipe] Exported ${docs.length} ${name} doc(s)`);
  }
  console.log(`[wipe] Backup written to ${outDir}`);
  console.log('[wipe] It contains customer names, emails, phones and addresses — keep it off git.');
}

// ─── 3. Disarm the renewal cron BEFORE dropping anything ─────────────────────

if (ORDERS_ONLY) {
  console.log('[wipe] --orders-only set — subscriptions left untouched');
  if (activeSubCount > 0) {
    console.log(`[wipe] WARNING: ${activeSubCount} subscription(s) are still active. The renewal`);
    console.log('       cron will keep charging those cards and writing new orders.');
  }
} else {
  const disarmed = await subs.updateMany(
    { status: 'active' },
    { $set: { status: 'cancelled' } },
  );
  console.log(`[wipe] Cancelled ${disarmed.modifiedCount} active subscription(s) — renewal cron disarmed`);
}

// ─── 4. Optionally detach the saved cards in Stripe ──────────────────────────

if (WITH_STRIPE) {
  const { getStripe } = await import('../src/config/stripe.js');
  const stripe = getStripe();

  const stripeRefs = await subs
    .find({}, { projection: { paymentMethodId: 1, stripeCustomerId: 1, email: 1 } })
    .toArray();

  const paymentMethodIds = [...new Set(stripeRefs.map((s) => s.paymentMethodId).filter(Boolean))];
  const customerIds      = [...new Set(stripeRefs.map((s) => s.stripeCustomerId).filter(Boolean))];

  let detached = 0;
  for (const pm of paymentMethodIds) {
    try {
      await stripe.paymentMethods.detach(pm);
      detached += 1;
    } catch (err) {
      // Already detached, or never existed — either way the card is not chargeable.
      if (err.code === 'resource_missing') continue;
      console.warn(`[wipe] Could not detach ${pm}: ${err.message}`);
    }
  }
  console.log(`[wipe] Detached ${detached}/${paymentMethodIds.length} payment method(s) in Stripe`);

  if (customerIds.length > 0) {
    console.log('[wipe] Stripe customers left in place (deletion is irreversible). Review manually:');
    for (const c of customerIds) console.log(`         ${c}`);
  }
}

// ─── 5. Drop the collections ─────────────────────────────────────────────────
//
// drop() rather than deleteMany({}): deleteMany leaves the freed WiredTiger
// blocks allocated to the collection file, and `compact` is unavailable on
// Atlas shared tiers, so dropping is the only way the space actually comes back.
// The indexes go with it — Connection.js rebuilds them on the next backend start.
//
for (const name of TARGETS) {
  try {
    await db.dropCollection(name);
    console.log(`[wipe] Dropped collection ${name}`);
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      console.log(`[wipe] Collection ${name} did not exist — skipping`);
    } else {
      throw err;
    }
  }
}

// ─── 6. Reset promo redemption counters ──────────────────────────────────────

if (KEEP_PROMOS) {
  console.log('[wipe] --keep-promos set — usage counters left as they are');
} else {
  const reset = await promos.updateMany(
    {},
    { $set: { usageCount: 0, redeemedEmails: [], redeemedIPs: [] } },
  );
  console.log(`[wipe] Reset usage on ${reset.modifiedCount} promo code(s)`);
}

await mongoose.disconnect();

console.log('');
console.log(`[wipe] Done. Restart the backend (pm2 restart <app>) so Connection.js`);
console.log(`       rebuilds the ${TARGETS.join(' / ')} index(es) on the fresh collection(s).`);
console.log('[wipe] Stripe still holds every real payment — this only cleared your own records.');
