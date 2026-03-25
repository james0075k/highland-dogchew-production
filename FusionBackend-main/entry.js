/**
 * entry.js — Real application entry point  (H-2 fix)
 *
 * Loads .env BEFORE any ES-module code runs.
 * In ESM, static `import` statements are hoisted and executed before the
 * module body — so dotenv inside index.js always ran too late to populate
 * process.env for the Stripe SDK initialisations in the controllers.
 *
 * Solution: call dotenv.config() here, then dynamically import index.js so
 * that every module in the dependency graph loads with env vars already set.
 *
 * Update your start script:
 *   "start": "nodemon entry.js"
 */

import { config } from 'dotenv';
config();

await import('./index.js');
