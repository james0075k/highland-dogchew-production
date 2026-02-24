import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Highland Dog Chew" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🐾 Welcome to the Highland Dog Chew Newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0;padding:0;background:#f4ede4;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(46,31,20,0.10);max-width:600px;width:100%;">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#2e1f14 0%,#5a3a1e 100%);padding:40px 40px 32px;text-align:center;">
                        <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;color:#c4a882;text-transform:uppercase;font-weight:600;">Premium Himalayan Dog Treats</p>
                        <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Highland Dog Chew</h1>
                        <div style="width:48px;height:3px;background:linear-gradient(to right,#f59e0b,#ea580c);border-radius:2px;margin:14px auto 0;"></div>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#2e1f14;">Welcome aboard! 🐾</p>
                        <p style="margin:0 0 20px;font-size:15px;color:#7a5c4f;line-height:1.7;">
                          Thank you for subscribing to the <strong style="color:#2e1f14;">Highland Dog Chew</strong> newsletter.
                          You're now part of a community that puts dog health and happiness first.
                        </p>
                        <p style="margin:0 0 28px;font-size:15px;color:#7a5c4f;line-height:1.7;">
                          Expect to hear from us about:
                        </p>
                        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                          <tr>
                            <td style="padding:10px 16px;background:#fdf8f3;border-left:3px solid #f59e0b;border-radius:4px;font-size:14px;color:#5a3a1e;margin-bottom:8px;display:block;">
                              🦴 &nbsp; New product launches &amp; restocks
                            </td>
                          </tr>
                          <tr><td height="8"></td></tr>
                          <tr>
                            <td style="padding:10px 16px;background:#fdf8f3;border-left:3px solid #f59e0b;border-radius:4px;font-size:14px;color:#5a3a1e;">
                              🎉 &nbsp; Exclusive subscriber discounts
                            </td>
                          </tr>
                          <tr><td height="8"></td></tr>
                          <tr>
                            <td style="padding:10px 16px;background:#fdf8f3;border-left:3px solid #f59e0b;border-radius:4px;font-size:14px;color:#5a3a1e;">
                              📖 &nbsp; Dog care tips &amp; nutrition guides
                            </td>
                          </tr>
                        </table>

                        <!-- CTA -->
                        <div style="text-align:center;margin-bottom:28px;">
                          <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:0.3px;">
                            Shop Now →
                          </a>
                        </div>

                        <p style="margin:0;font-size:13px;color:#c4a882;line-height:1.6;">
                          If you didn't sign up for this newsletter, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#fdf8f3;border-top:1px solid #e8dfd1;padding:24px 40px;text-align:center;">
                        <p style="margin:0 0 4px;font-size:13px;color:#7a5c4f;">
                          © ${new Date().getFullYear()} Highland Dog Chew · Premium Himalayan Dog Treats
                        </p>
                        <p style="margin:0;font-size:12px;color:#c4a882;">Crafted with care for your beloved pets 🐕</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Subscribed successfully! Check your inbox.' });
  } catch (err) {
    console.error('Newsletter email error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send confirmation email. Please try again.' });
  }
};
