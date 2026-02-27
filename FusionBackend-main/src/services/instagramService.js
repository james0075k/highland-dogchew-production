/**
 * Instagram Graph API service
 *
 * Uses Node 18+ native fetch — no extra packages needed.
 * Caches the last successful response for CACHE_TTL ms (30 min by default).
 *
 * Required .env variable:
 *   INSTAGRAM_ACCESS_TOKEN  — long-lived token from Meta Developer console
 *
 * Token lifespan: 60 days.  Refresh it at:
 *   https://graph.instagram.com/refresh_access_token
 *     ?grant_type=ig_refresh_token&access_token=<YOUR_TOKEN>
 */

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in ms

const _cache = {
  posts: null,
  expiresAt: 0,
};

/**
 * Fetch up to `limit` active posts from the authenticated Instagram account.
 * Results are cached for CACHE_TTL ms to avoid hitting rate limits.
 *
 * @param {number} limit   Max posts to return (1–12)
 * @returns {{ posts: object[], cached: boolean }}
 * @throws  Error with .igCode (Instagram error code) when the API fails
 */
export const fetchInstagramFeed = async (limit = 8) => {
  const now = Date.now();

  // --- Return cached data if still fresh ---
  if (_cache.posts && now < _cache.expiresAt) {
    return { posts: _cache.posts, cached: true };
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'INSTAGRAM_ACCESS_TOKEN is not set in .env. ' +
      'Generate a long-lived token in Meta Developer Console.'
    );
  }

  const fields = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'permalink',
    'thumbnail_url',
    'timestamp',
  ].join(',');

  // Fetch slightly more than needed so filtering still yields `limit` items
  const fetchLimit = Math.min(limit * 2, 20);
  const url =
    `https://graph.instagram.com/me/media` +
    `?fields=${fields}&limit=${fetchLimit}&access_token=${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let json;
  try {
    const res = await fetch(url, { signal: controller.signal });
    json = await res.json();

    if (!res.ok) {
      const igErr = json?.error ?? {};
      const err = new Error(igErr.message || `Instagram API returned ${res.status}`);
      err.igCode = igErr.code;
      err.igType = igErr.type;
      throw err;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  const rawItems = json.data ?? [];

  const posts = rawItems
    .filter(item =>
      ['IMAGE', 'CAROUSEL_ALBUM', 'VIDEO'].includes(item.media_type)
    )
    .slice(0, limit)
    .map(item => ({
      id: item.id,
      caption: item.caption ?? '',
      mediaType: item.media_type,                   // IMAGE | CAROUSEL_ALBUM | VIDEO
      // Graph API doesn't serve VIDEO urls directly — use thumbnail instead
      image:
        item.media_type === 'VIDEO'
          ? (item.thumbnail_url ?? item.media_url ?? '')
          : (item.media_url ?? ''),
      isVideo: item.media_type === 'VIDEO',
      isCarousel: item.media_type === 'CAROUSEL_ALBUM',
      permalink: item.permalink ?? '',
      timestamp: item.timestamp,
    }));

  // --- Update cache ---
  _cache.posts = posts;
  _cache.expiresAt = now + CACHE_TTL;

  return { posts, cached: false };
};

/** Force-clear the cache (called when settings change). */
export const clearInstagramCache = () => {
  _cache.posts = null;
  _cache.expiresAt = 0;
};

/** Returns how many seconds until the cache expires (0 if expired). */
export const cacheStatus = () => ({
  cached: !!(_cache.posts && Date.now() < _cache.expiresAt),
  expiresInSeconds: Math.max(0, Math.round((_cache.expiresAt - Date.now()) / 1000)),
  postCount: _cache.posts?.length ?? 0,
});
