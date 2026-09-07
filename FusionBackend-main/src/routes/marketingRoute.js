import { Router } from 'express';
import {
  getReviewCandidates,
  sendReviewRequests,
  getNewsletterAudience,
  sendNewsletter,
  previewNewsletter,
  getCampaigns,
} from '../controllers/marketingController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const marketingRoute = Router();

// Everything here reaches customers' inboxes — admin only, no exceptions.
marketingRoute.use(authenticate, authorizeRoles('admin', 'superadmin'));

// GET  /api/admin/marketing/review-candidates  — orders eligible for a request
marketingRoute.get('/review-candidates', getReviewCandidates);

// POST /api/admin/marketing/review-requests/send
marketingRoute.post('/review-requests/send', sendReviewRequests);

// GET  /api/admin/marketing/newsletter/audience — recipient count for a filter
marketingRoute.get('/newsletter/audience', getNewsletterAudience);

// POST /api/admin/marketing/newsletter/send
marketingRoute.post('/newsletter/send', sendNewsletter);

// POST /api/admin/marketing/newsletter/preview — render without sending
marketingRoute.post('/newsletter/preview', previewNewsletter);

// GET  /api/admin/marketing/campaigns — send history
marketingRoute.get('/campaigns', getCampaigns);

export default marketingRoute;
