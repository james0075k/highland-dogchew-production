import { BetaAnalyticsDataClient } from '@google-analytics/data';
import handleSuccess from '../utils/successHandler.js';
import logger from '../utils/logger.js';

/**
 * GA4 Realtime analytics for the admin dashboard.
 *
 * Reads live "active users" (last ~30 min) from the Google Analytics Data API
 * via a service account. Until the env vars below are set, every endpoint
 * responds with { configured: false } so the dashboard can render a friendly
 * "not connected yet" state instead of erroring.
 *
 * Required env (see .env):
 *   GA4_PROPERTY_ID   numeric GA4 property id, e.g. 499123456
 *   GA4_CLIENT_EMAIL  service-account email (…iam.gserviceaccount.com)
 *   GA4_PRIVATE_KEY   service-account private key (PEM, \n-escaped is fine)
 */

const PROPERTY_ID  = process.env.GA4_PROPERTY_ID;
const CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL;
// .env stores the PEM with literal "\n" — turn those back into real newlines.
const PRIVATE_KEY  = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');

const isConfigured = Boolean(PROPERTY_ID && CLIENT_EMAIL && PRIVATE_KEY);

// Lazily-built singleton client (only created once, on first configured call).
let client = null;
function getClient() {
  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
    });
  }
  return client;
}

// ─── In-memory cache ─────────────────────────────────────────────────────────
// The dashboard polls every ~20s and several admins may watch at once. A short
// TTL keeps us comfortably inside GA's Realtime quota and makes the endpoint snappy.
const CACHE_TTL_MS = 15_000;
let cache = { at: 0, payload: null };

// ─── GET /api/admin/analytics/live ──────────────────────────────────────────
export const getLiveUsers = async (req, res, next) => {
  try {
    if (!isConfigured) {
      return handleSuccess(res, 200, 'Analytics not configured', { configured: false });
    }

    // Serve from cache if fresh.
    if (cache.payload && Date.now() - cache.at < CACHE_TTL_MS) {
      return handleSuccess(res, 200, 'Live users (cached)', { ...cache.payload, cached: true });
    }

    const analytics = getClient();
    const property = `properties/${PROPERTY_ID}`;

    // Three small realtime reports in parallel: total, by page, by device.
    const [totalRes, pagesRes, devicesRes] = await Promise.all([
      analytics.runRealtimeReport({
        property,
        metrics: [{ name: 'activeUsers' }],
      }),
      analytics.runRealtimeReport({
        property,
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 5,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
      analytics.runRealtimeReport({
        property,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
      }),
    ]);

    const activeUsers = Number(totalRes[0]?.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    const topPages = (pagesRes[0]?.rows ?? []).map(row => ({
      page: row.dimensionValues?.[0]?.value || '(unknown)',
      users: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    for (const row of devicesRes[0]?.rows ?? []) {
      const key = row.dimensionValues?.[0]?.value;
      const val = Number(row.metricValues?.[0]?.value ?? 0);
      if (key in devices) devices[key] = val;
    }

    const payload = {
      configured: true,
      activeUsers,
      topPages,
      devices,
      fetchedAt: new Date().toISOString(),
    };

    cache = { at: Date.now(), payload };
    return handleSuccess(res, 200, 'Live users fetched', payload);
  } catch (err) {
    logger.error({ err }, 'GA4 realtime fetch failed');
    // Degrade gracefully: serve last good data if we have it, else a zeroed payload.
    if (cache.payload) {
      return handleSuccess(res, 200, 'Live users (stale)', { ...cache.payload, stale: true });
    }
    return handleSuccess(res, 200, 'Live users unavailable', {
      configured: true,
      activeUsers: 0,
      topPages: [],
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      error: true,
      fetchedAt: new Date().toISOString(),
    });
  }
};
