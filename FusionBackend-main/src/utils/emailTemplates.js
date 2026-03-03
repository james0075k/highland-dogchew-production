/**
 * Email HTML templates for Highland Dog Chew orders.
 * All templates return complete HTML strings suitable for nodemailer.
 */

const brand = {
  name: 'Highland Yak Chew',
  color: '#2f1e14',
  accent: '#d97706',
  supportEmail: process.env.SMTP_USER || 'admin@highlanddogchew.co.uk',
  siteUrl: process.env.APP_URL || 'https://highlanddogchew.co.uk',
};

// ─── Shared layout wrapper ────────────────────────────────────────────────────

function layout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2f1e14;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${brand.color};padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:300;letter-spacing:0.15em;text-transform:lowercase;">
                highland yak chew
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f0e8;padding:24px 40px;text-align:center;border-top:1px solid #e8dfd0;">
              <p style="margin:0 0 8px;font-size:13px;color:#7a5c4f;">
                Questions? Email us at
                <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
              </p>
              <p style="margin:0;font-size:12px;color:#b8a99a;">
                &copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.
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

// ─── Item rows helper ─────────────────────────────────────────────────────────

function itemRows(items) {
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;">
        <p style="margin:0;font-weight:600;font-size:14px;">${item.name}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#7a5c4f;">
          Size: ${item.size || 'Default'} &nbsp;·&nbsp; Qty: ${item.quantity}
        </p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;text-align:right;font-weight:600;font-size:14px;white-space:nowrap;">
        £${(item.unitPrice * item.quantity).toFixed(2)}
      </td>
    </tr>`
    )
    .join('');
}

// ─── Pricing summary helper ───────────────────────────────────────────────────

function pricingRows(order) {
  const rows = [
    ['Subtotal', `£${order.subtotal.toFixed(2)}`],
    order.totalDiscount > 0 ? ['Discount', `-£${order.totalDiscount.toFixed(2)}`] : null,
    ['VAT (20%)', `£${order.totalTax.toFixed(2)}`],
    ['Shipping', `£${order.totalDelivery.toFixed(2)}`],
  ]
    .filter(Boolean)
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">${label}</td>
      <td style="padding:6px 0;font-size:13px;text-align:right;">${value}</td>
    </tr>`
    )
    .join('');

  return `${rows}
    <tr>
      <td style="padding:12px 0 0;font-size:16px;font-weight:700;border-top:2px solid #2f1e14;">Total</td>
      <td style="padding:12px 0 0;font-size:16px;font-weight:700;text-align:right;color:${brand.accent};border-top:2px solid #2f1e14;">
        £${order.grandTotal.toFixed(2)}
      </td>
    </tr>`;
}

// ─── Customer Order Confirmation ──────────────────────────────────────────────

export function customerOrderEmailHtml(order, firstName) {
  const addr = order.shippingAddress;

  const body = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;">Order Confirmed!</h2>
    <p style="margin:0 0 24px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName || addr.fullName.split(' ')[0]}, thank you for your order.
      We'll email you when it ships.
    </p>

    <!-- Order number banner -->
    <div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:#7a5c4f;">Order number</span>
      <span style="font-size:15px;font-weight:700;letter-spacing:0.05em;">${order.orderNumber}</span>
    </div>

    <!-- Items -->
    <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7a5c4f;">
      Your Items
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemRows(order.items)}
    </table>

    <!-- Pricing -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${pricingRows(order)}
    </table>

    <!-- Shipping address -->
    <h3 style="margin:0 0 10px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7a5c4f;">
      Delivery Address
    </h3>
    <div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:28px;font-size:14px;line-height:1.7;">
      <strong>${addr.fullName}</strong><br/>
      ${addr.addressLine1}<br/>
      ${addr.addressLine2 ? addr.addressLine2 + '<br/>' : ''}
      ${addr.city}${addr.county ? ', ' + addr.county : ''}<br/>
      ${addr.postcode}<br/>
      ${addr.country}
      ${addr.phone ? `<br/>${addr.phone}` : ''}
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${brand.siteUrl}/products"
         style="display:inline-block;background:${brand.accent};color:#fff;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
        Continue Shopping
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#7a5c4f;text-align:center;line-height:1.6;">
      Need help with your order? Contact us at
      <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
    </p>
  `;

  return layout(`Order Confirmation – ${order.orderNumber}`, body);
}

// ─── Admin New Order Alert ────────────────────────────────────────────────────

export function adminOrderEmailHtml(order, meta) {
  const addr = order.shippingAddress;
  const firstName = meta.c_firstName || addr.firstName || '';
  const lastName  = meta.c_lastName  || addr.lastName  || '';
  const email     = meta.c_email     || addr.email;
  const phone     = meta.c_phone     || addr.phone || 'N/A';

  const body = `
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-weight:700;font-size:15px;">🛒 New Order Received — Action Required</p>
      <p style="margin:4px 0 0;font-size:13px;color:#856404;">
        A new order has been placed and payment confirmed by Stripe.
      </p>
    </div>

    <!-- Order ID -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;width:140px;">Order Number</td>
        <td style="padding:6px 0;font-size:14px;font-weight:700;">${order.orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Payment Status</td>
        <td style="padding:6px 0;font-size:14px;font-weight:700;color:#15803d;">${order.paymentStatus.toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Order Date</td>
        <td style="padding:6px 0;font-size:14px;">${new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Stripe Payment Intent</td>
        <td style="padding:6px 0;font-size:12px;font-family:monospace;color:#7a5c4f;">${order.paymentIntentId}</td>
      </tr>
    </table>

    <!-- Customer details -->
    <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7a5c4f;">
      Customer Details
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f5f0e8;border-radius:8px;padding:0;">
      <tr><td style="padding:8px 16px;font-size:13px;color:#7a5c4f;width:130px;">Full Name</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:#7a5c4f;background:#ede8df;">Email</td><td style="padding:8px 16px;font-size:14px;background:#ede8df;"><a href="mailto:${email}" style="color:${brand.accent};text-decoration:none;">${email}</a></td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:#7a5c4f;">Phone</td><td style="padding:8px 16px;font-size:14px;">${phone}</td></tr>
    </table>

    <!-- Shipping address -->
    <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7a5c4f;">
      Shipping Address
    </h3>
    <div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:24px;font-size:14px;line-height:1.7;">
      ${addr.addressLine1}<br/>
      ${addr.addressLine2 ? addr.addressLine2 + '<br/>' : ''}
      ${addr.city}${addr.county ? ', ' + addr.county : ''}<br/>
      ${addr.postcode}<br/>
      ${addr.country}
    </div>

    <!-- Items -->
    <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7a5c4f;">
      Products Ordered
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemRows(order.items)}
    </table>

    <!-- Pricing -->
    <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7a5c4f;">
      Payment Breakdown
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${pricingRows(order)}
    </table>

    <p style="margin:0;font-size:12px;color:#b8a99a;text-align:center;">
      This alert was generated automatically when payment was confirmed by Stripe.
    </p>
  `;

  return layout(`New Order – ${order.orderNumber}`, body);
}
