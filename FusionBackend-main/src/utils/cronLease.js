/**
 * cronLease.js — distributed single-instance lock for scheduled jobs.
 *
 * Why: when running multiple Node instances (PM2 cluster, Docker replicas, blue/green),
 * every instance fires its own setInterval. Per-record idempotency in the job is
 * already enforced (see processSubscriptions's nextBillingDate claim), but a lease
 * still prevents wasted work, log spam, and rare cross-instance races on shared state.
 *
 * Implementation: a single Mongo document per job name. acquire() does a conditional
 * findOneAndUpdate that only succeeds if the existing lease is missing or stale.
 * No extra dependency, no Redis required.
 */

import mongoose from 'mongoose';

const cronLeaseSchema = new mongoose.Schema({
  name:      { type: String, unique: true, required: true },
  holder:    { type: String, required: true }, // identifier for the holding process
  expiresAt: { type: Date,   required: true },
}, { timestamps: true });

const CronLeaseModel =
  mongoose.models.CronLease || mongoose.model('CronLease', cronLeaseSchema);

const HOLDER_ID = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Try to acquire a named lease for ttlMs milliseconds.
 * Returns true on success, false if another instance currently holds it.
 *
 * Run the protected job inside `if (await acquireLease(name, ttl)) { ... }`.
 * On crash, the lease auto-expires after ttlMs so jobs aren't blocked forever.
 */
export async function acquireLease(name, ttlMs) {
  const now       = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);
  try {
    const result = await CronLeaseModel.findOneAndUpdate(
      { name, $or: [{ expiresAt: { $lte: now } }, { holder: HOLDER_ID }] },
      { name, holder: HOLDER_ID, expiresAt },
      { upsert: true, new: true },
    );
    return !!result;
  } catch (err) {
    // Duplicate key on upsert means another instance won the race
    if (err?.code === 11000) return false;
    console.error(`[cronLease] acquire(${name}) failed:`, err.message);
    return false;
  }
}

export async function releaseLease(name) {
  try {
    await CronLeaseModel.deleteOne({ name, holder: HOLDER_ID });
  } catch (err) {
    console.error(`[cronLease] release(${name}) failed:`, err.message);
  }
}
