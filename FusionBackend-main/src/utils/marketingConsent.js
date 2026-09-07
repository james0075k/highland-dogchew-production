/**
 * Unsubscribe links and the suppression check that every marketing send runs.
 *
 * The token is a signed JWT rather than a stored row: there is nothing to clean
 * up, a link stays valid indefinitely (people unsubscribe from year-old email),
 * and the address cannot be tampered with to unsubscribe somebody else.
 */

import jwt from 'jsonwebtoken';
import Config from '../config/Config.js';
import MarketingOptOutModel from '../models/marketingOptOutModel.js';
import Subscriber from '../models/subscriberModel.js';
import logger from './logger.js';

const log = logger.child({ component: 'marketingConsent' });

const SITE_URL = () => process.env.APP_URL || 'https://highlanddogchew.co.uk';
const API_URL = () => process.env.API_PUBLIC_URL || `${SITE_URL()}/api`;

export function createUnsubscribeToken(email, scope = 'all') {
  return jwt.sign({ email: String(email).toLowerCase().trim(), scope, t: 'unsub' }, Config.jwtSecret);
}

export function verifyUnsubscribeToken(token) {
  try {
    const payload = jwt.verify(token, Config.jwtSecret);
    if (payload?.t !== 'unsub' || !payload.email) return null;
    return { email: payload.email, scope: payload.scope || 'all' };
  } catch {
    return null;
  }
}

export function unsubscribeUrl(email, scope = 'all') {
  return `${API_URL()}/newsletter/unsubscribe/${createUnsubscribeToken(email, scope)}`;
}

/**
 * Headers that give Gmail/Outlook their own native unsubscribe button.
 * List-Unsubscribe-Post is what makes it one-click (RFC 8058) — without it the
 * client only offers to open the URL.
 */
export function unsubscribeHeaders(email, scope = 'all') {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl(email, scope)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/** Record the opt-out. Idempotent: clicking the link twice is fine. */
export async function recordOptOut(email, scope = 'all', reason = 'unsubscribed') {
  const normalised = String(email).toLowerCase().trim();

  await MarketingOptOutModel.updateOne(
    { email: normalised, scope },
    { $setOnInsert: { email: normalised, scope, reason } },
    { upsert: true }
  );

  // Keep the newsletter list consistent with the suppression list, so the
  // subscriber count an admin sees is the count that will actually be mailed.
  if (scope === 'all' || scope === 'newsletter') {
    await Subscriber.updateOne({ email: normalised }, { isActive: false });
  }

  log.info({ scope, reason }, 'Marketing opt-out recorded');
}

/**
 * Given a list of addresses, return the set that must NOT be mailed for this
 * scope — 'all' opt-outs suppress every scope.
 */
export async function getSuppressedEmails(emails, scope) {
  const normalised = [...new Set(emails.map((e) => String(e).toLowerCase().trim()).filter(Boolean))];
  if (normalised.length === 0) return new Set();

  const rows = await MarketingOptOutModel.find({
    email: { $in: normalised },
    scope: { $in: ['all', scope] },
  })
    .select('email')
    .lean();

  return new Set(rows.map((r) => r.email));
}
