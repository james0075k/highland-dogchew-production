import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

import errorMiddleware from './src/middlewares/ErrorMiddleware/errorMiddleware.js';
import Connection from './src/config/Connection.js';
import LogoRoute from './src/routes/LogoRoute.js';
import testimonialRoute from './src/routes/testimonialRoute.js';
import faqRoute from './src/routes/faqRoute.js';
import partnerRoute from './src/routes/partnerRoute.js';
import blogRoute from './src/routes/blogRoute.js';
import destinationRoute from './src/routes/destionationRoute.js';
import statRoute from './src/routes/statRoute.js';
import contactRoute from './src/routes/contactRoute.js';
import heroBannerRoute from './src/routes/heroBannerRoute.js';
import tourPackageRoute from './src/routes/tourPackageRoute.js';
import BookingRoute from './src/routes/bookingRoute.js';
import ReviewRoute from './src/routes/reviewRoute.js';
import adminRoute from './src/routes/adminRoute.js';
import teamRoute from './src/routes/teamRoute.js';
import activityRoute from './src/routes/activityRoutes.js';
import tourCategoryRoute from './src/routes/tourCategoryRoutes.js';
import paymentRoute from './src/routes/paymentRoute.js';
import blogCategory from './src/routes/blogCategoryRoute.js';
import contactinfoRoute from './src/routes/contactinfoRoute.js';
import privateTripRoute from './src/routes/privatetripRoute.js';
import termsRoute from './src/routes/termsRoute.js';
import productRoute from './src/routes/productRoute.js';
import varietyRoute from './src/routes/varietyRoute.js';
import cartPaymentRoute from './src/routes/cartPaymentRoute.js';
import promoCodeRoute from './src/routes/promoCodeRoute.js';
import orderRoute from './src/routes/orderRoute.js';
import productWebhookRoute from './src/routes/productWebhookRoute.js';
import adminOrderRoute from './src/routes/adminOrderRoute.js';
import adminSubscriptionRoute from './src/routes/adminSubscriptionRoute.js';
import subscriptionProcessRoute from './src/routes/subscriptionProcessRoute.js';
import newsletterRoute from './src/routes/newsletterRoute.js';
import instagramPostRoute from './src/routes/instagramPostRoute.js';
import instagramRoute from './src/routes/instagramRoute.js';
import galleryItemRoute from './src/routes/galleryItemRoute.js';
import categoryRoute from './src/routes/categoryRoute.js';
import customerSubscriptionRoute from './src/routes/customerSubscriptionRoute.js';

// ─── Validate required environment variables at startup ──────────────────────
// NOTE: dotenv.config() is called in entry.js BEFORE this module loads.
//       Do not call it here — in ESM, imports run before module body code.
const requiredEnvVars = [
  'mongoConnectionString',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'PRODUCT_WEBHOOK_SECRET', // required — webhook signature verification fails without it
];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`[STARTUP] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('[STARTUP] Please check your .env file');
  process.exit(1);
}

const app = express();
const api = process.env.API_URL || 'api';
const port = process.env.PORT || 3333;

// Trust the first proxy hop (Nginx / Cloudflare / Railway / Heroku).
// Required for express-rate-limit to read the real client IP from X-Forwarded-For
// instead of the reverse proxy's IP (which would make all clients share one bucket).
app.set('trust proxy', 1);

// Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.)
// crossOriginResourcePolicy disabled because /uploads is consumed cross-origin by the Next frontend.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // CSP belongs in the frontend; API serves JSON, not HTML
}));

// Gzip JSON responses — typically 70%+ smaller for product lists
app.use(compression());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://dogchewuk.vercel.app',
    'https://highlanddogchew.co.uk',
    'https://www.highlanddogchew.co.uk',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

// Webhook route MUST be before express.json() — Stripe needs raw body
app.use(`/${api}/webhook`, productWebhookRoute);

// C-2 fix: was 1000mb — a 1 GB POST would exhaust server memory.
// Payment + API routes need at most a few KB; uploads use their own multer limits.
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ limit: '50kb', extended: true }));

// L-3 fix: only log requests in non-production environments
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[dev] ${req.method} ${req.url}`);
    next();
  });
}

app.use(`/${api}/logo`, LogoRoute);
app.use(`/${api}/testimonials`, testimonialRoute);
app.use(`/${api}/faqs`, faqRoute);
app.use(`/${api}/partners`, partnerRoute);
app.use(`/${api}/blogs`, blogRoute);
app.use(`/${api}/destinations`, destinationRoute);
app.use(`/${api}/stats`, statRoute);
app.use(`/${api}/contact`, contactRoute);
app.use(`/${api}/herobanner`, heroBannerRoute);
app.use(`/${api}/tour/tour-packages`, tourPackageRoute);
app.use(`/${api}/tour/bookings`, BookingRoute);
app.use(`/${api}/reviews`, ReviewRoute);
app.use(`/${api}/admin`, adminRoute);
app.use(`/${api}/teams`, teamRoute);
app.use(`/${api}/activities`, activityRoute);
app.use(`/${api}/category/activities`, tourCategoryRoute);
app.use(`/${api}/payments`, paymentRoute);
app.use(`/${api}/category/blogs`, blogCategory);
app.use(`/${api}/info`, contactinfoRoute);
app.use(`/${api}/privatetrip`, privateTripRoute);
app.use(`/${api}/terms`, termsRoute);
app.use(`/${api}/products`, productRoute);
app.use(`/${api}/variety`, varietyRoute);
app.use(`/${api}/cart-payments`, cartPaymentRoute);
app.use(`/${api}/promo`, promoCodeRoute);
app.use(`/${api}/orders`, orderRoute);
app.use(`/${api}/admin/orders`, adminOrderRoute);
app.use(`/${api}/admin/subscriptions`, adminSubscriptionRoute);
app.use(`/${api}/subscriptions`, subscriptionProcessRoute);
app.use(`/${api}/newsletter`, newsletterRoute);
app.use(`/${api}/instagram-posts`, instagramPostRoute);
app.use(`/${api}/instagram`, instagramRoute);
app.use(`/${api}/gallery`, galleryItemRoute);
app.use(`/${api}/categories`, categoryRoute);
app.use(`/${api}/customer/subscriptions`, customerSubscriptionRoute);

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.originalUrl.startsWith(`/${api}/`)) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
  next();
});

// Error middleware (must be last)
app.use(errorMiddleware);

// Global unhandled rejection / exception catchers
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message);
  process.exit(1);
});

// Database connection — wait for DB before accepting requests
Connection().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

// ─── Daily subscription renewal cron ─────────────────────────────────────────
// Lease ensures only ONE instance runs the sweep when scaling horizontally.
// Per-subscription idempotency is enforced inside processSubscriptions
// (atomic nextBillingDate claim), so this is a duplicate-work guard, not a
// correctness guard. Lease TTL > expected sweep duration; auto-expires on crash.
Promise.all([
  import('./src/controllers/subscriptionProcessController.js'),
  import('./src/utils/cronLease.js'),
]).then(([{ processSubscriptions }, { acquireLease, releaseLease }]) => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const LEASE_NAME        = 'subscription-renewal';
  const LEASE_TTL_MS      = 30 * 60 * 1000; // 30 min — long enough for any sane sweep

  async function runSweep(label) {
    const got = await acquireLease(LEASE_NAME, LEASE_TTL_MS);
    if (!got) {
      console.log(`[cron] ${label} skipped — another instance holds the lease`);
      return;
    }
    try {
      await processSubscriptions();
    } catch (err) {
      console.error(`[cron] ${label} failed:`, err.message);
    } finally {
      await releaseLease(LEASE_NAME);
    }
  }

  setTimeout(() => runSweep('Startup sweep'), 60_000);
  setInterval(() => runSweep('Daily sweep'),  TWENTY_FOUR_HOURS);

  console.log('[cron] Subscription renewal cron scheduled (every 24 h, single-instance leased)');
}).catch((err) => console.error('[cron] Failed to load subscription processor:', err.message));
