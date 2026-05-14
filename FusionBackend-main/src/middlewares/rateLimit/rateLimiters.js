/**
 * Centralized rate limiters for sensitive endpoints.
 *
 * Express trusts the first proxy hop (set in index.js), so the real client IP
 * is read from X-Forwarded-For — every client gets its own bucket.
 *
 * Tune the windows/limits with care: too tight, you block legit users on slow
 * networks retrying; too loose, you don't actually deter abuse.
 */
import rateLimit from 'express-rate-limit';

const baseOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
};

export const paymentLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 20,
});

export const promoLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: 10,
});

export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
});

export const newsletterLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 5,
});

export const contactLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  max: 5,
});
