import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import cron from 'node-cron';

import logger from './src/utils/logger.js';
import errorMiddleware from './src/middlewares/ErrorMiddleware/errorMiddleware.js';
import Connection from './src/config/Connection.js';
import LogoRoute from './src/routes/LogoRoute.js';
import testimonialRoute from './src/routes/testimonialRoute.js';
import faqRoute from './src/routes/faqRoute.js';
import partnerRoute from './src/routes/partnerRoute.js';
import blogRoute from './src/routes/blogRoute.js';
import destinationRoute from './src/routes/destinationRoute.js';
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
import galleryItemRoute from './src/routes/galleryItemRoute.js';
import categoryRoute from './src/routes/categoryRoute.js';
import customerSubscriptionRoute from './src/routes/customerSubscriptionRoute.js';
import noSqlSanitize from './src/middlewares/sanitize/noSqlSanitize.js';

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
  logger.fatal({ missingVars }, 'Missing required environment variables. Check your .env file.');
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

// Production origins are always allowed. Localhost origins only in non-production
// so that leaked dev URLs cannot be exploited against a real deployment.
const PROD_ORIGINS = [
  'https://dogchewuk.vercel.app',
  'https://highlanddogchew.co.uk',
  'https://www.highlanddogchew.co.uk',
];
const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? PROD_ORIGINS
  : [...PROD_ORIGINS, ...DEV_ORIGINS];

app.use(cors({
  origin: allowedOrigins,
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

// Strip Mongo operator keys ($ne, $gt, $where, etc.) from req.body. Joi
// schemas reject these on validated routes; this is a backstop for any
// future endpoint that forgets validation.
app.use(noSqlSanitize);

// Structured HTTP request logging — pino-http picks up method, url, status,
// response time, and the client's real IP (via trust proxy above).
app.use(pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
}));

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
  logger.error({ reason }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

// Database connection — wait for DB before accepting requests
Connection().then(() => {
  app.listen(port, () => {
    logger.info({ port }, 'Server listening');
  });
});

// ─── Daily subscription renewal cron ─────────────────────────────────────────
// node-cron runs on a real schedule string (no drift across long uptimes) and
// the cluster lease still guarantees single-instance execution. Per-subscription
// idempotency lives inside processSubscriptions (atomic nextBillingDate claim).
const cronLog = logger.child({ component: 'cron' });

Promise.all([
  import('./src/controllers/subscriptionProcessController.js'),
  import('./src/utils/cronLease.js'),
]).then(([{ processSubscriptions }, { acquireLease, releaseLease }]) => {
  const LEASE_NAME   = 'subscription-renewal';
  const LEASE_TTL_MS = 30 * 60 * 1000;
  // Daily at 02:00 UTC — quiet hours for the UK customer base and well away
  // from peak Stripe API traffic. Override via SUBSCRIPTION_CRON if needed.
  const SCHEDULE     = process.env.SUBSCRIPTION_CRON || '0 2 * * *';

  if (!cron.validate(SCHEDULE)) {
    cronLog.fatal({ schedule: SCHEDULE }, 'Invalid SUBSCRIPTION_CRON expression');
    process.exit(1);
  }

  async function runSweep(label) {
    const got = await acquireLease(LEASE_NAME, LEASE_TTL_MS);
    if (!got) {
      cronLog.info({ label }, 'Sweep skipped — another instance holds the lease');
      return;
    }
    const start = Date.now();
    try {
      await processSubscriptions();
      cronLog.info({ label, ms: Date.now() - start }, 'Sweep completed');
    } catch (err) {
      cronLog.error({ err, label }, 'Sweep failed');
    } finally {
      await releaseLease(LEASE_NAME);
    }
  }

  // Startup sweep one minute after boot to catch anything missed during downtime
  setTimeout(() => runSweep('startup'), 60_000);

  cron.schedule(SCHEDULE, () => runSweep('scheduled'), { timezone: 'UTC' });
  cronLog.info({ schedule: SCHEDULE, tz: 'UTC' }, 'Subscription renewal cron scheduled');
}).catch((err) => cronLog.error({ err }, 'Failed to load subscription processor'));
