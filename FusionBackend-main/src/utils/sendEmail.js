import nodemailer from 'nodemailer';

/**
 * Send an email via Hostinger SMTP.
 *
 * Required env vars:
 *   SMTP_HOST  = smtp.hostinger.com
 *   SMTP_PORT  = 465  (SSL) or 587 (STARTTLS)
 *   SMTP_USER  = admin@highlanddogchew.co.uk
 *   SMTP_PASS  = (mailbox password)
 *   SMTP_FROM  = "Highland Yak Chew <admin@highlanddogchew.co.uk>"
 *
 * Port 465 -> secure: true (implicit SSL)
 * Port 587 -> secure: false + requireTLS: true (STARTTLS)
 *
 * Every caller treats sending as fire-and-forget (`sendEmail(...).catch(log)`),
 * because an email must never block order creation. The consequence is that a
 * single dropped connection used to mean the customer simply never received
 * their receipt — so delivery is retried here, where every caller benefits.
 */

const MAX_ATTEMPTS = 3;
const BACKOFF_MS   = [1000, 4000]; // waits between attempt 1→2 and 2→3

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One transporter for the process, not one per email. Nodemailer pools and
// reuses the SMTP connection, which also avoids a fresh TLS handshake per send.
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Port 465 = implicit SSL (secure: true); port 587 = STARTTLS (secure: false)
  const useSSL = port === 465;

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: useSSL,
    ...(!useSSL && { requireTLS: true }),
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    tls: {
      rejectUnauthorized: true,
    },
  });

  return _transporter;
}

// A 5xx SMTP reply means the server rejected the message itself (bad address,
// rejected content) — retrying sends the same message to the same refusal.
// Everything else (network drop, timeout, 4xx greylisting) is worth another go.
function isPermanent(err) {
  const code = err?.responseCode;
  return typeof code === 'number' && code >= 500 && code < 600;
}

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[email] SMTP_USER or SMTP_PASS not set — cannot send email');
    return;
  }

  const from = process.env.SMTP_FROM || '"Highland Yak Chew" <admin@highlanddogchew.co.uk>';

  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await getTransporter().sendMail({ from, to, subject, html });
      if (attempt > 1) {
        console.log(`[email] Sent to ${to} on attempt ${attempt} — "${subject}"`);
      }
      return;
    } catch (err) {
      lastErr = err;

      if (isPermanent(err)) {
        console.error(
          `[email] PERMANENT FAILURE to=${to} subject="${subject}" ` +
          `code=${err.responseCode}: ${err.message}`,
        );
        throw err;
      }

      if (attempt < MAX_ATTEMPTS) {
        console.warn(
          `[email] Attempt ${attempt}/${MAX_ATTEMPTS} failed for ${to} (${err.message}) — retrying`,
        );
        // Drop the pooled transporter: a broken connection would otherwise be
        // handed straight back to the next attempt.
        _transporter?.close?.();
        _transporter = null;
        await sleep(BACKOFF_MS[attempt - 1]);
      }
    }
  }

  // Nothing else will retry this — make it findable so it can be resent by hand.
  console.error(
    `[email] FINAL FAILURE after ${MAX_ATTEMPTS} attempts. to=${to} subject="${subject}": ` +
    `${lastErr?.message}`,
  );
  throw lastErr;
};

export default sendEmail;
