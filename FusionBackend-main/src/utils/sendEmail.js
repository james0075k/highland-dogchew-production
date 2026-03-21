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
 */
const sendEmail = async ({ to, subject, html }) => {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Highland Yak Chew" <admin@highlanddogchew.co.uk>';

  if (!user || !pass) {
    console.error('[email] SMTP_USER or SMTP_PASS not set — cannot send email');
    return;
  }

  // Port 465 = implicit SSL (secure: true); port 587 = STARTTLS (secure: false)
  const useSSL = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: useSSL,
    ...(!useSSL && { requireTLS: true }),
    auth: { user, pass },
    tls: {
      rejectUnauthorized: true,
    },
  });

  await transporter.sendMail({ from, to, subject, html });
};

export default sendEmail;
