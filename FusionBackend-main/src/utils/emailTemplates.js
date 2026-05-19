/**
 * Email HTML templates for Highland Dog Chew orders and subscriptions.
 * All templates return complete HTML strings suitable for nodemailer.
 */

const brand = {
  name: 'Highland Yak Chew',
  color: '#2f1e14',
  accent: '#d97706',
  supportEmail: 'admin@highlanddogchew.co.uk',
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
              <p style="margin:0 0 8px;font-size:12px;color:#b8a99a;">
                <a href="${brand.siteUrl}" style="color:${brand.accent};text-decoration:none;">highlanddogchew.co.uk</a>
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
      <td style="padding:12px 0;border-bottom:1px solid #f0ebe3;">
        <p style="margin:0;font-weight:600;font-size:14px;color:#2f1e14;">${item.name}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#7a5c4f;">
          Size: ${item.size || 'Default'} &nbsp;&middot;&nbsp; Qty: ${item.quantity}
        </p>
        ${item.subscriptionInterval
          ? `<p style="margin:4px 0 0;font-size:12px;">
               <span style="display:inline-block;background:#ecfdf5;color:#065f46;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;letter-spacing:0.03em;">
                 SUBSCRIPTION ACTIVE &mdash; ${item.subscriptionInterval}
               </span>
             </p>`
          : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f0ebe3;text-align:right;font-weight:600;font-size:14px;white-space:nowrap;vertical-align:top;">
        &pound;${(item.unitPrice * item.quantity).toFixed(2)}
      </td>
    </tr>`
    )
    .join('');
}

// ─── Pricing summary helper ───────────────────────────────────────────────────

function pricingRows(order) {
  const rows = [
    ['Subtotal', `&pound;${order.subtotal.toFixed(2)}`],
    order.totalDiscount > 0 ? ['Discount', `&minus;&pound;${order.totalDiscount.toFixed(2)}`] : null,
    ['Shipping', `&pound;${order.totalDelivery.toFixed(2)}`],
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
        &pound;${order.grandTotal.toFixed(2)}
      </td>
    </tr>`;
}

// ─── Customer Order Confirmation ──────────────────────────────────────────────

export function customerOrderEmailHtml(order, firstName, options = {}) {
  const addr = order.shippingAddress;
  const hasSubscription = options.hasSubscription || false;
  const subItems = (order.items || []).filter((i) => i.subscriptionInterval);

  const body = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;">Order Confirmed!</h2>
    <p style="margin:0 0 24px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName || addr.fullName.split(' ')[0]}, thank you for your order.
      We'll email you when it ships.
    </p>

    <!-- Order number banner -->
    <div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#7a5c4f;">Order number</td>
          <td style="font-size:15px;font-weight:700;letter-spacing:0.05em;text-align:right;">${order.orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:4px;">Date</td>
          <td style="font-size:13px;text-align:right;padding-top:4px;">${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:4px;">Payment</td>
          <td style="font-size:13px;font-weight:600;color:#065f46;text-align:right;padding-top:4px;">Paid</td>
        </tr>
      </table>
    </div>

    <!-- Items -->
    <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
      Your Items
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemRows(order.items)}
    </table>

    <!-- Subscription status banner -->
    ${hasSubscription && subItems.length > 0
      ? `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 6px;font-weight:700;font-size:15px;color:#065f46;">Subscription Active</p>
                <p style="margin:0;font-size:13px;color:#047857;line-height:1.6;">
                  ${subItems.map((i) => `<strong>${i.name}</strong> &mdash; ${i.subscriptionInterval}`).join('<br/>')}
                </p>
                <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">
                  Your subscription will auto-renew. We'll charge your saved payment method and ship
                  automatically on each renewal date. You can manage or cancel anytime.
                </p>
              </td>
            </tr>
          </table>
        </div>`
      : `<div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
          <p style="margin:0;font-size:13px;color:#7a5c4f;">
            <strong>No active subscription</strong> &mdash; This is a one-time purchase.
            Want regular deliveries? <a href="${brand.siteUrl}/products" style="color:${brand.accent};text-decoration:none;font-weight:600;">Subscribe &amp; save</a> on your next order.
          </p>
        </div>`
    }

    <!-- Pricing -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${pricingRows(order)}
    </table>

    <!-- Shipping address -->
    <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
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
  const hasSubscription = meta.hasSubscription === 'true';
  const subItems = (order.items || []).filter((i) => i.subscriptionInterval);

  const body = `
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-weight:700;font-size:15px;">New Order Received &mdash; Action Required</p>
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
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Subscription</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:${hasSubscription ? '#065f46' : '#7a5c4f'};">
          ${hasSubscription ? 'Yes &mdash; Active' : 'No &mdash; One-time purchase'}
        </td>
      </tr>
    </table>

    <!-- Customer details -->
    <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
      Customer Details
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f5f0e8;border-radius:8px;padding:0;">
      <tr><td style="padding:8px 16px;font-size:13px;color:#7a5c4f;width:130px;">Full Name</td><td style="padding:8px 16px;font-size:14px;font-weight:600;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:#7a5c4f;background:#ede8df;">Email</td><td style="padding:8px 16px;font-size:14px;background:#ede8df;"><a href="mailto:${email}" style="color:${brand.accent};text-decoration:none;">${email}</a></td></tr>
      <tr><td style="padding:8px 16px;font-size:13px;color:#7a5c4f;">Phone</td><td style="padding:8px 16px;font-size:14px;">${phone}</td></tr>
    </table>

    <!-- Shipping address -->
    <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
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
    <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
      Products Ordered
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemRows(order.items)}
    </table>

    ${hasSubscription && subItems.length > 0
      ? `<!-- Subscription details for admin -->
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-weight:700;font-size:14px;color:#065f46;">Subscription Items</p>
          <p style="margin:0;font-size:13px;color:#047857;line-height:1.7;">
            ${subItems.map((i) => `${i.name} &mdash; ${i.subscriptionInterval}`).join('<br/>')}
          </p>
        </div>`
      : ''}

    <!-- Pricing -->
    <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
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

// ─── Subscription Renewal Charged ────────────────────────────────────────────

export function subscriptionRenewalEmailHtml(sub, order) {
  const addr = sub.shippingAddress || {};
  const firstName = addr.firstName || addr.fullName?.split(' ')[0] || 'there';

  const body = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;">Your Subscription Has Been Renewed</h2>
    <p style="margin:0 0 24px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName}, your recurring delivery has been charged and will be on its way soon.
    </p>

    <!-- Subscription ID banner -->
    <div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#7a5c4f;">Subscription</td>
          <td style="font-size:14px;font-weight:700;text-align:right;">${sub.subscriptionId}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Order</td>
          <td style="font-size:14px;font-weight:700;text-align:right;padding-top:6px;">${order?.orderNumber || '—'}</td>
        </tr>
      </table>
    </div>

    <!-- Product summary -->
    <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7a5c4f;">
      This Delivery
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;">
          <p style="margin:0;font-weight:600;font-size:14px;">${sub.productName}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#7a5c4f;">Size: ${sub.size || 'Default'} &nbsp;&middot;&nbsp; Qty: ${sub.quantity} &nbsp;&middot;&nbsp; ${sub.intervalLabel}</p>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;text-align:right;font-weight:600;font-size:14px;">
          &pound;${(sub.unitPrice * sub.quantity).toFixed(2)}
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;font-weight:700;">Total Charged</td>
        <td style="padding:10px 0;font-size:14px;font-weight:700;text-align:right;color:${brand.accent};">
          &pound;${order ? order.grandTotal.toFixed(2) : (sub.unitPrice * sub.quantity).toFixed(2)}
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${brand.siteUrl}/track-order?tab=subscriptions"
         style="display:inline-block;background:${brand.accent};color:#fff;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
        Manage My Subscription
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#7a5c4f;text-align:center;line-height:1.6;">
      Need to pause or cancel? Contact us at
      <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
    </p>
  `;

  return layout(`Subscription Renewed – ${sub.subscriptionId}`, body);
}

// ─── Subscription Payment Failed ─────────────────────────────────────────────

// ─── Subscription Cancelled — Customer ──────────────────────────────────────

export function subscriptionCancelledCustomerEmailHtml(sub) {
  const addr = sub.shippingAddress || {};
  const firstName = addr.firstName || addr.fullName?.split(' ')[0] || 'there';

  const body = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;">Subscription Cancelled</h2>
    <p style="margin:0 0 24px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName}, your subscription has been cancelled as requested. You will not be charged again.
    </p>

    <div style="background:#f5f0e8;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#7a5c4f;">Subscription</td>
          <td style="font-size:14px;font-weight:700;text-align:right;">${sub.subscriptionId}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Product</td>
          <td style="font-size:14px;text-align:right;padding-top:6px;">${sub.productName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Frequency</td>
          <td style="font-size:14px;text-align:right;padding-top:6px;">${sub.intervalLabel || 'Every 4 weeks'}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Status</td>
          <td style="font-size:14px;font-weight:600;color:#b91c1c;text-align:right;padding-top:6px;">Cancelled</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 24px;font-size:14px;color:#7a5c4f;line-height:1.6;">
      We're sorry to see you go! If you change your mind, you can always start a new subscription from our shop.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${brand.siteUrl}/products"
         style="display:inline-block;background:${brand.accent};color:#fff;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
        Browse Products
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#7a5c4f;text-align:center;line-height:1.6;">
      Questions? Contact us at
      <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
    </p>
  `;

  return layout(`Subscription Cancelled – ${sub.subscriptionId}`, body);
}

// ─── Subscription Cancelled — Admin ─────────────────────────────────────────

export function subscriptionCancelledAdminEmailHtml(sub) {
  const addr = sub.shippingAddress || {};

  const body = `
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-weight:700;font-size:15px;color:#b91c1c;">Subscription Cancelled</p>
      <p style="margin:4px 0 0;font-size:13px;color:#7f1d1d;">
        A customer has cancelled their subscription.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;width:140px;">Subscription ID</td>
        <td style="padding:6px 0;font-size:14px;font-weight:700;">${sub.subscriptionId}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Product</td>
        <td style="padding:6px 0;font-size:14px;">${sub.productName} (${sub.size || 'Default'})</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Frequency</td>
        <td style="padding:6px 0;font-size:14px;">${sub.intervalLabel || 'Every 4 weeks'}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Customer Email</td>
        <td style="padding:6px 0;font-size:14px;"><a href="mailto:${sub.email}" style="color:${brand.accent};text-decoration:none;">${sub.email}</a></td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Customer Name</td>
        <td style="padding:6px 0;font-size:14px;">${addr.fullName || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#7a5c4f;">Unit Price</td>
        <td style="padding:6px 0;font-size:14px;">&pound;${(sub.unitPrice || 0).toFixed(2)} &times; ${sub.quantity || 1}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:12px;color:#b8a99a;text-align:center;">
      This alert was generated automatically when a subscription was cancelled.
    </p>
  `;

  return layout(`Subscription Cancelled – ${sub.subscriptionId}`, body);
}

// ─── Subscription Paused — Customer ─────────────────────────────────────────

export function subscriptionPausedEmailHtml(sub) {
  const addr = sub.shippingAddress || {};
  const firstName = addr.firstName || addr.fullName?.split(' ')[0] || 'there';

  const body = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;">Subscription Paused</h2>
    <p style="margin:0 0 24px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName}, your subscription has been paused. You won't be charged until you resume it.
    </p>

    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#7a5c4f;">Subscription</td>
          <td style="font-size:14px;font-weight:700;text-align:right;">${sub.subscriptionId}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Product</td>
          <td style="font-size:14px;text-align:right;padding-top:6px;">${sub.productName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Status</td>
          <td style="font-size:14px;font-weight:600;color:#92400e;text-align:right;padding-top:6px;">Paused</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 24px;font-size:14px;color:#7a5c4f;line-height:1.6;">
      You can resume your subscription at any time from your account or by contacting us.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${brand.siteUrl}/track-order?tab=subscriptions"
         style="display:inline-block;background:${brand.accent};color:#fff;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
        Manage My Subscription
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#7a5c4f;text-align:center;line-height:1.6;">
      Need help? Contact us at
      <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
    </p>
  `;

  return layout(`Subscription Paused – ${sub.subscriptionId}`, body);
}

// ─── Subscription Resumed — Customer ────────────────────────────────────────

export function subscriptionResumedEmailHtml(sub) {
  const addr = sub.shippingAddress || {};
  const firstName = addr.firstName || addr.fullName?.split(' ')[0] || 'there';

  const body = `
    <h2 style="margin:0 0 6px;font-size:24px;font-weight:700;">Subscription Resumed</h2>
    <p style="margin:0 0 24px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName}, great news — your subscription is active again! Your next delivery is on its way at the scheduled date.
    </p>

    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#7a5c4f;">Subscription</td>
          <td style="font-size:14px;font-weight:700;text-align:right;">${sub.subscriptionId}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Product</td>
          <td style="font-size:14px;text-align:right;padding-top:6px;">${sub.productName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Frequency</td>
          <td style="font-size:14px;text-align:right;padding-top:6px;">${sub.intervalLabel || 'Every 4 weeks'}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Next Billing</td>
          <td style="font-size:14px;font-weight:600;color:#065f46;text-align:right;padding-top:6px;">
            ${sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Soon'}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#7a5c4f;padding-top:6px;">Status</td>
          <td style="font-size:14px;font-weight:600;color:#065f46;text-align:right;padding-top:6px;">Active</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${brand.siteUrl}/track-order?tab=subscriptions"
         style="display:inline-block;background:${brand.accent};color:#fff;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
        Manage My Subscription
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#7a5c4f;text-align:center;line-height:1.6;">
      Need help? Contact us at
      <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
    </p>
  `;

  return layout(`Subscription Resumed – ${sub.subscriptionId}`, body);
}

// ─── Subscription Payment Failed ─────────────────────────────────────────────

export function subscriptionPaymentFailedEmailHtml(sub, reason) {
  const addr = sub.shippingAddress || {};
  const firstName = addr.firstName || addr.fullName?.split(' ')[0] || 'there';

  const body = `
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-weight:700;font-size:15px;color:#b91c1c;">Subscription Payment Failed</p>
      <p style="margin:4px 0 0;font-size:13px;color:#7f1d1d;">We were unable to charge your payment method for your subscription renewal.</p>
    </div>

    <p style="margin:0 0 20px;color:#7a5c4f;font-size:15px;">
      Hi ${firstName}, your subscription <strong>${sub.subscriptionId}</strong> (${sub.productName}, ${sub.intervalLabel}) could not be renewed.
    </p>

    ${reason ? `<p style="margin:0 0 20px;font-size:14px;color:#2f1e14;"><strong>Reason:</strong> ${reason}</p>` : ''}

    <p style="margin:0 0 24px;font-size:14px;color:#7a5c4f;">
      Please update your payment method or contact us so we can resolve this for you.
      Your subscription is currently on hold until payment succeeds.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="mailto:${brand.supportEmail}"
         style="display:inline-block;background:${brand.accent};color:#fff;font-weight:700;font-size:14px;
                padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
        Contact Support
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#7a5c4f;text-align:center;">
      ${brand.supportEmail}
    </p>
  `;

  return layout(`Action Required – Subscription Payment Failed`, body);
}
