/**
 * Captures outbound email instead of sending it.
 *
 * This is not optional plumbing. dotenv loads the real .env when Config.js is
 * imported, so SMTP_USER/SMTP_PASS are the live Hostinger mailbox during a test
 * run — an unmocked send would put test messages in real customers' inboxes.
 * Importing this module in a test file replaces the sender outright.
 *
 * Tests read `sentEmails` to assert who was mailed and what they were sent.
 */
import { vi } from 'vitest';

export const sentEmails = [];

export function resetEmailMock() {
  sentEmails.length = 0;
  emailMockState.failFor = () => false;
}

export const emailMockState = {
  /** Return true for an address to simulate a permanent send failure. */
  failFor: () => false,
};

const fakeSendEmail = vi.fn(async ({ to, subject, html, text, headers, attachments }) => {
  if (emailMockState.failFor(to)) {
    throw new Error('Simulated SMTP failure');
  }
  sentEmails.push({ to, subject, html, text, headers, attachments });
});

vi.mock('../../src/utils/sendEmail.js', () => ({
  default: fakeSendEmail,
}));

export { fakeSendEmail };
