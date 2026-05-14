/**
 * tests/setup.js
 *
 * Boots a fresh in-memory MongoDB for the test process, sets the env vars the
 * app expects, and tears everything down at the end of the run.
 *
 * Why in-memory mongo, not a docker container: faster, hermetic, runs on
 * Windows/CI/dev without external services. Each test file truncates only the
 * collections it touched, so the suite is isolated without paying the cost of
 * restarting the server.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer;

beforeAll(async () => {
  // Required env vars (validated at app startup) — fake values are fine for tests
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  process.env.PRODUCT_WEBHOOK_SECRET = 'whsec_test_fake';
  process.env.ADMIN_EMAIL = 'admin@test.local';
  process.env.LOG_LEVEL = 'silent';

  mongoServer = await MongoMemoryServer.create();
  process.env.mongoConnectionString = mongoServer.getUri();
  await mongoose.connect(process.env.mongoConnectionString);
}, 120_000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
