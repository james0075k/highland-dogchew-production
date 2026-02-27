import express from 'express';
import {
  getLiveFeed,
  getSettings,
  updateSettings,
  bustCache,
} from '../controllers/instagramController.js';
import {
  authenticate,
  authorizeRoles,
} from '../middlewares/authMiddleware/authMiddleware.js';

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get('/feed',     getLiveFeed);   // live posts from Graph API
router.get('/settings', getSettings);   // isEnabled + postsCount

// ── Admin only ───────────────────────────────────────────────
router.put(
  '/settings',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  updateSettings,
);

router.delete(
  '/cache',
  authenticate,
  authorizeRoles('admin', 'superadmin'),
  bustCache,
);

export default router;
