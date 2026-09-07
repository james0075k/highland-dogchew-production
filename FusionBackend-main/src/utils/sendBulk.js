/**
 * Throttled fan-out for marketing sends.
 *
 * Hostinger SMTP is a shared mailbox, not a bulk provider: firing a few hundred
 * sendMail calls in a Promise.all gets the connection throttled and, past a
 * point, the domain's reputation dinged. So sends run a few at a time with a
 * short gap, which for a list this size costs seconds and buys deliverability.
 *
 * Per-message retry/backoff already lives in sendEmail — this only governs pace
 * and collects the outcome for each recipient so the admin sees exactly who
 * failed rather than a single "some emails failed".
 */

import sendEmail from './sendEmail.js';
import logger from './logger.js';

const log = logger.child({ component: 'sendBulk' });

const CONCURRENCY = 3;
const GAP_MS = 250;
// A single click should never be able to start a 10,000-message send.
export const MAX_BATCH = 500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {Array<{to: string, subject: string, html: string, headers?: object}>} messages
 * @returns {Promise<{sent: number, failed: number, results: Array<{to, ok, error?}>}>}
 */
export async function sendBulk(messages) {
  const queue = messages.slice(0, MAX_BATCH);
  if (messages.length > MAX_BATCH) {
    log.warn(
      { requested: messages.length, cap: MAX_BATCH },
      'Batch truncated to the send cap — run the remainder as a second batch'
    );
  }

  const results = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const slice = queue.slice(i, i + CONCURRENCY);

    const settled = await Promise.allSettled(slice.map((m) => sendEmail(m)));

    settled.forEach((outcome, idx) => {
      const to = slice[idx].to;
      if (outcome.status === 'fulfilled') {
        sent += 1;
        results.push({ to, ok: true });
      } else {
        failed += 1;
        results.push({ to, ok: false, error: outcome.reason?.message || 'Send failed' });
      }
    });

    if (i + CONCURRENCY < queue.length) await sleep(GAP_MS);
  }

  log.info({ sent, failed, total: queue.length }, 'Bulk send finished');
  return { sent, failed, results, truncated: messages.length > MAX_BATCH };
}

export default sendBulk;
