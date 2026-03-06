import Subscriber from '../models/subscriberModel.js';
import sendEmail from '../utils/sendEmail.js';

/* ── Welcome email HTML ─────────────────────────────────────────────────────── */
function welcomeEmailHtml(email) {
  const siteUrl = process.env.APP_URL || 'https://highlanddogchew.co.uk';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Highland Yak Chew</title>
</head>
<body style="margin:0;padding:0;background:#f4ede4;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede4;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(46,31,20,0.12);">

        <!-- ── Header ─────────────────────────────────────────── -->
        <tr>
          <td style="background:linear-gradient(135deg,#2e1f14 0%,#4a2e18 50%,#2e1f14 100%);padding:44px 40px 36px;text-align:center;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:4px;color:#c4a882;text-transform:uppercase;font-weight:600;">
              Premium Himalayan Dog Treats
            </p>
            <h1 style="margin:0;font-size:30px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;">
              Highland Yak Chew
            </h1>
            <div style="width:52px;height:3px;background:linear-gradient(to right,#f59e0b,#ea580c);border-radius:99px;margin:16px auto 0;"></div>
          </td>
        </tr>

        <!-- ── Hero welcome ────────────────────────────────────── -->
        <tr>
          <td style="padding:44px 40px 36px;text-align:center;border-bottom:1px solid #f0e8de;">
            <div style="font-size:42px;margin-bottom:16px;">🐾</div>
            <h2 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#2e1f14;line-height:1.2;">
              You&rsquo;re in the pack!
            </h2>
            <p style="margin:0;font-size:15px;color:#7a5c4f;line-height:1.8;max-width:400px;margin:0 auto;">
              Welcome to the <strong style="color:#2e1f14;">Highland Yak Chew</strong> family.
              Thank you for subscribing — your dog is already wagging their tail.
            </p>
          </td>
        </tr>

        <!-- ── What to expect ─────────────────────────────────── -->
        <tr>
          <td style="padding:36px 40px;border-bottom:1px solid #f0e8de;">
            <h3 style="margin:0 0 20px;font-size:13px;font-weight:700;color:#c4a882;letter-spacing:3px;text-transform:uppercase;text-align:center;">
              What&rsquo;s coming your way
            </h3>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding:12px 16px;background:#fdf8f3;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;margin-bottom:10px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2e1f14;">🦴 &nbsp; New Product Launches</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7a5c4f;">Be the first to know about new flavours & restocks</p>
                </td>
              </tr>
              <tr><td height="10"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#fdf8f3;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2e1f14;">🎉 &nbsp; Exclusive Subscriber Offers</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7a5c4f;">Special discounts only available to our newsletter family</p>
                </td>
              </tr>
              <tr><td height="10"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#fdf8f3;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2e1f14;">📖 &nbsp; Dog Health &amp; Nutrition Tips</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7a5c4f;">Expert guides on chew habits, dental care &amp; more</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Product showcase ───────────────────────────────── -->
        <tr>
          <td style="padding:36px 40px;border-bottom:1px solid #f0e8de;">
            <h3 style="margin:0 0 20px;font-size:13px;font-weight:700;color:#c4a882;letter-spacing:3px;text-transform:uppercase;text-align:center;">
              Our range
            </h3>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="33%" style="padding:0 6px 0 0;vertical-align:top;">
                  <div style="background:#fdf8f3;border-radius:12px;padding:20px 14px;text-align:center;border:1px solid #f0e8de;">
                    <div style="font-size:28px;margin-bottom:8px;">🧀</div>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2e1f14;">Yak Milk Chews</p>
                    <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.5;">Long-lasting natural chews</p>
                  </div>
                </td>
                <td width="33%" style="padding:0 3px;vertical-align:top;">
                  <div style="background:#fdf8f3;border-radius:12px;padding:20px 14px;text-align:center;border:1px solid #f0e8de;">
                    <div style="font-size:28px;margin-bottom:8px;">✨</div>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2e1f14;">Puff Treats</p>
                    <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.5;">Light &amp; crunchy rewards</p>
                  </div>
                </td>
                <td width="33%" style="padding:0 0 0 6px;vertical-align:top;">
                  <div style="background:#fdf8f3;border-radius:12px;padding:20px 14px;text-align:center;border:1px solid #f0e8de;">
                    <div style="font-size:28px;margin-bottom:8px;">🏔️</div>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2e1f14;">Highland Mix</p>
                    <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.5;">Premium blended chews</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Trust badges ───────────────────────────────────── -->
        <tr>
          <td style="padding:28px 40px;background:#fdf8f3;border-bottom:1px solid #f0e8de;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="25%" style="text-align:center;padding:0 8px;">
                  <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#2e1f14;">100%</p>
                  <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.4;">Natural<br/>Ingredients</p>
                </td>
                <td width="25%" style="text-align:center;padding:0 8px;border-left:1px solid #e8dfd1;">
                  <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#2e1f14;">4.9★</p>
                  <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.4;">Customer<br/>Rating</p>
                </td>
                <td width="25%" style="text-align:center;padding:0 8px;border-left:1px solid #e8dfd1;">
                  <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#2e1f14;">500+</p>
                  <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.4;">Happy<br/>Dogs</p>
                </td>
                <td width="25%" style="text-align:center;padding:0 8px;border-left:1px solid #e8dfd1;">
                  <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#2e1f14;">Vet</p>
                  <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.4;">Approved<br/>Formula</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── CTA ────────────────────────────────────────────── -->
        <tr>
          <td style="padding:40px 40px 36px;text-align:center;">
            <p style="margin:0 0 24px;font-size:15px;color:#7a5c4f;line-height:1.7;">
              Ready to treat your pup to the very best Himalayan chews?
            </p>
            <a href="${siteUrl}/products"
               style="display:inline-block;padding:15px 40px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#ffffff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;letter-spacing:0.3px;box-shadow:0 4px 15px rgba(245,158,11,0.35);">
              Shop Our Range &rarr;
            </a>
            <p style="margin:24px 0 0;font-size:12px;color:#c4a882;line-height:1.6;">
              If you didn&rsquo;t subscribe to our newsletter, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- ── Footer ─────────────────────────────────────────── -->
        <tr>
          <td style="background:#2e1f14;padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#c4a882;font-weight:600;letter-spacing:1px;">
              HIGHLAND YAK CHEW
            </p>
            <p style="margin:0 0 12px;font-size:12px;color:#7a5c4f;line-height:1.6;">
              Premium Himalayan Dog Treats &nbsp;&bull;&nbsp; ${siteUrl.replace('https://', '').replace('http://', '')}
            </p>
            <p style="margin:0;font-size:11px;color:#5a3a28;">
              &copy; ${year} Highland Yak Chew. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

/* ── Subscribe ──────────────────────────────────────────────────────────────── */
export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const normalised = email.toLowerCase().trim();

  try {
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: normalised });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "You're already subscribed! Keep an eye on your inbox.",
      });
    }

    // Save subscriber
    await Subscriber.create({ email: normalised });

    // Send welcome email
    await sendEmail({
      to: normalised,
      subject: 'Welcome to Highland Yak Chew 🐾',
      html: welcomeEmailHtml(normalised),
    });

    return res.status(201).json({
      success: true,
      message: 'Subscribed successfully! Check your inbox for a welcome email.',
    });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};

/* ── Get all subscribers (admin) ────────────────────────────────────────────── */
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .select('email subscribedAt');
    return res.status(200).json({ success: true, count: subscribers.length, data: subscribers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscribers.' });
  }
};

/* ── Unsubscribe ────────────────────────────────────────────────────────────── */
export const unsubscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required.' });
  try {
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isActive: false }
    );
    return res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to unsubscribe.' });
  }
};
