import {
  fetchInstagramFeed,
  clearInstagramCache,
  cacheStatus,
} from '../services/instagramService.js';
import InstagramSettings from '../models/instagramSettingsModel.js';
import handleSuccess from '../utils/sucessHandler.js';

/** Helper: get-or-create the singleton settings document. */
const getOrCreateSettings = () =>
  InstagramSettings.findOne().then(
    doc => doc ?? InstagramSettings.create({ isEnabled: true, postsCount: 8 })
  );

/* ─────────────────────────────────────────────────────────────
   PUBLIC — GET /api/instagram/feed
   Returns live Instagram posts from the Graph API.
   Returns empty array (not an error) when:
     • section is disabled by admin
     • token is missing / expired (UI falls back to manual posts)
───────────────────────────────────────────────────────────── */
export const getLiveFeed = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    if (!settings.isEnabled) {
      return res.status(200).json({
        success: true,
        data: [],
        disabled: true,
        message: 'Instagram feed is disabled by admin.',
      });
    }

    const { posts, cached } = await fetchInstagramFeed(settings.postsCount);

    return res.status(200).json({
      success: true,
      data: posts,
      cached,
      ...cacheStatus(),
    });
  } catch (err) {
    // Instagram token errors (190 = token invalid/expired, 100 = param error)
    if (err.igCode === 190 || err.igCode === 100) {
      console.error('[Instagram] Token error:', err.message);
      return res.status(200).json({
        success: false,
        data: [],
        tokenError: true,
        message: 'Instagram access token is invalid or expired. Please refresh it in Meta Developer Console.',
      });
    }

    // Timeout / network error — don't crash the site
    if (err.name === 'AbortError') {
      console.error('[Instagram] Request timed out');
      return res.status(200).json({
        success: false,
        data: [],
        message: 'Instagram API timed out.',
      });
    }

    // Config error — return helpful message
    if (err.message?.includes('INSTAGRAM_ACCESS_TOKEN')) {
      return res.status(200).json({
        success: false,
        data: [],
        configError: true,
        message: err.message,
      });
    }

    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   PUBLIC — GET /api/instagram/settings
   Returns current settings (isEnabled, postsCount).
───────────────────────────────────────────────────────────── */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    return handleSuccess(res, 200, 'Instagram settings fetched', settings);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN — PUT /api/instagram/settings
   Body: { isEnabled?: boolean, postsCount?: number }
───────────────────────────────────────────────────────────── */
export const updateSettings = async (req, res, next) => {
  try {
    const { isEnabled, postsCount } = req.body;
    const settings = await getOrCreateSettings();

    if (typeof isEnabled === 'boolean') settings.isEnabled = isEnabled;
    if (typeof postsCount === 'number' && postsCount >= 1 && postsCount <= 12) {
      settings.postsCount = postsCount;
    }

    const saved = await settings.save();
    clearInstagramCache(); // force fresh fetch after settings change
    return handleSuccess(res, 200, 'Instagram settings updated', saved);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN — DELETE /api/instagram/cache
   Manually clear the 30-min memory cache.
───────────────────────────────────────────────────────────── */
export const bustCache = (req, res) => {
  clearInstagramCache();
  return res.status(200).json({ success: true, message: 'Instagram cache cleared.' });
};
