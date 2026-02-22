import nodemailer from 'nodemailer';

/**
 * Send an email via Gmail SMTP with STARTTLS (port 587).
 *
 * Required env vars:
 *   SMTP_HOST  = smtp.gmail.com
 *   SMTP_PORT  = 587
 *   SMTP_USER  = your-gmail@gmail.com
 *   SMTP_PASS  = xxxx xxxx xxxx xxxx  (16-char Google App Password)
 *   SMTP_FROM  = "Admin Support <your-gmail@gmail.com>"
 *
 * Falls back to legacy SMTP_EMAIL / SMTP_PASSWORD if new vars are absent.
 */
const sendEmail = async ({ to, subject, html }) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || `"Highland Dog Chew" <${user}>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,       // false = plain connection that upgrades via STARTTLS
    requireTLS: true,    // refuse connection if server does not support TLS upgrade
    auth: { user, pass },
    tls: {
      rejectUnauthorized: true,
    },
  });

  await transporter.sendMail({ from, to, subject, html });
};

export default sendEmail;
