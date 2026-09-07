/**
 * Email templates for marketing sends — review requests and the newsletter.
 *
 * Kept separate from emailTemplates.js (transactional order/subscription mail)
 * because these carry obligations the transactional ones don't: every message
 * needs a visible unsubscribe link, and the tone is promotional rather than a
 * receipt. Same visual language as the order emails so a customer recognises
 * who it's from.
 *
 * Constraints these templates work within:
 *  - Tables and inline styles only. Gmail strips <style> blocks; Outlook uses
 *    Word to render, so flexbox/grid are out.
 *  - JPEG/PNG images only — Outlook on Windows can't display WebP.
 *  - Every image needs alt text and the layout has to survive images being
 *    blocked, which is the default in a lot of clients.
 */

const brand = {
  name: 'Highland Yak Chew',
  color: '#2f1e14',
  accent: '#d97706',
  cream: '#f5f0e8',
  supportEmail: 'admin@highlanddogchew.co.uk',
};

const siteUrl = () => process.env.APP_URL || 'https://highlanddogchew.co.uk';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ─── Shared layout ────────────────────────────────────────────────────────────

/**
 * @param {string} title      — <title>, also used by some clients in previews
 * @param {string} preheader  — the grey line after the subject in the inbox list
 * @param {string} bodyHtml
 * @param {string} unsubscribeUrl
 */
function marketingLayout({ title, preheader, bodyHtml, unsubscribeUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.cream};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${brand.color};">

  <!-- Preheader: shown in the inbox list, hidden in the open message -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${brand.cream};padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:${brand.color};padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:300;letter-spacing:0.15em;text-transform:lowercase;">
                highland yak chew
              </h1>
            </td>
          </tr>

          ${bodyHtml}

          <tr>
            <td style="background:${brand.cream};padding:24px 40px;text-align:center;border-top:1px solid #e8dfd0;">
              <p style="margin:0 0 8px;font-size:13px;color:#7a5c4f;">
                Questions? Email us at
                <a href="mailto:${brand.supportEmail}" style="color:${brand.accent};text-decoration:none;">${brand.supportEmail}</a>
              </p>
              <p style="margin:0 0 12px;font-size:12px;color:#b8a99a;">
                <a href="${siteUrl()}" style="color:${brand.accent};text-decoration:none;">highlanddogchew.co.uk</a>
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#b8a99a;">
                &copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#b8a99a;">
                You're receiving this because you bought from us or joined our list.
                <a href="${unsubscribeUrl}" style="color:#7a5c4f;text-decoration:underline;">Unsubscribe</a>
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

/**
 * Hero image row. Renders nothing at all when there's no image rather than
 * leaving an empty box or a broken-image icon at the top of the message.
 */
function heroBlock(src, alt) {
  if (!src) return '';
  return `
          <tr>
            <td style="padding:0;">
              <img src="${src}" width="600" alt="${esc(alt)}"
                   style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
            </td>
          </tr>`;
}

// ─── Review request ───────────────────────────────────────────────────────────

function starRow(reviewUrl) {
  // Stars as text, not images: they render even when images are blocked, and
  // there's no asset to load. Each links straight into the review form.
  return `<a href="${reviewUrl}" style="text-decoration:none;font-size:26px;letter-spacing:4px;color:#f0b429;">&#9733;&#9733;&#9733;&#9733;&#9733;</a>`;
}

function productBlock(item) {
  const thumb = item.image
    ? `<img src="${esc(item.image)}" width="72" height="72" alt="${esc(item.name)}"
           style="display:block;width:72px;height:72px;border-radius:8px;object-fit:cover;border:1px solid #f0ebe3;" />`
    : '';

  return `
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 16px;">
              <tr>
                <td width="88" style="vertical-align:top;padding-right:16px;">${thumb}</td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${brand.color};">${esc(item.name)}</p>
                  <p style="margin:0 0 8px;font-size:13px;color:#7a5c4f;">How did your dog get on with it?</p>
                  ${starRow(item.reviewUrl)}
                  <p style="margin:8px 0 0;font-size:12px;">
                    <a href="${item.reviewUrl}" style="color:${brand.accent};text-decoration:none;font-weight:600;">Write a quick review &rarr;</a>
                  </p>
                </td>
              </tr>
            </table>`;
}

/**
 * @param {object} params
 * @param {string} params.firstName
 * @param {string} params.orderNumber
 * @param {Array<{name, image, reviewUrl}>} params.items
 * @param {string} params.unsubscribeUrl
 */
export function reviewRequestEmailHtml({ firstName, orderNumber, items, unsubscribeUrl, heroSrc }) {
  const name = (firstName || '').trim();
  // "Dear there" reads worse than no name at all.
  const greeting = name ? `Dear ${esc(name)},` : 'Hello,';

  const body = `
          ${heroBlock(heroSrc, 'A happy dog out in the autumn grass')}

          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${brand.color};">${greeting}</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#5b4636;">
                Your order has landed and we hope it went down well. We're a small team in the UK
                sourcing every chew from the Himalayas, and honest feedback from real dog owners is
                genuinely how we decide what to make next.
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.75;color:#5b4636;">
                If you have a minute, we'd love to hear what your dog made of it.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px 8px;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#b8a99a;letter-spacing:2px;text-transform:uppercase;">
                From order ${esc(orderNumber)}
              </p>
              ${items.map(productBlock).join('')}
            </td>
          </tr>

          <tr>
            <td style="padding:8px 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:${brand.cream};border-radius:10px;border-left:3px solid ${brand.accent};">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#5b4636;">
                      A review takes about a minute, and there's no need to be polite about it &mdash;
                      if something wasn't right, tell us and we'll put it straight.
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:#5b4636;">
                      Thank you for trusting us with your dog. It genuinely means a lot.
                    </p>
                    <p style="margin:14px 0 0;font-size:14px;color:${brand.color};font-weight:700;">
                      &mdash; The Highland Yak Chew team &#128062;
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return marketingLayout({
    title: 'How did your dog get on?',
    preheader: `A minute of your time on order ${orderNumber} would help us a lot.`,
    bodyHtml: body,
    unsubscribeUrl,
  });
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

const RANGE = [
  { img: 'yak-milk-category.jpg', label: 'Yak Milk Chews', blurb: 'Long-lasting natural chews', href: '/products/yak-chews' },
  { img: 'puff-treats-category.jpg', label: 'Puff Treats', blurb: 'Light &amp; crunchy rewards', href: '/products/puff-treats' },
  { img: 'highland-mix-category.jpg', label: 'Highland Mix', blurb: 'Premium blended chews', href: '/products/highland-mix' },
];

function rangeStrip() {
  return `
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                ${RANGE.map(
                  (r, i) => `
                <td width="33%" style="vertical-align:top;padding:${i === 0 ? '0 6px 0 0' : i === 1 ? '0 3px' : '0 0 0 6px'};">
                  <a href="${siteUrl()}${r.href}" style="text-decoration:none;">
                    <img src="${siteUrl()}/images/${r.img}" width="170" alt="${r.label}"
                         style="display:block;width:100%;height:auto;border-radius:10px 10px 0 0;border:0;" />
                    <div style="background:${brand.cream};border-radius:0 0 10px 10px;padding:12px 10px;text-align:center;">
                      <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:${brand.color};">${r.label}</p>
                      <p style="margin:0;font-size:11px;color:#7a5c4f;line-height:1.5;">${r.blurb}</p>
                    </div>
                  </a>
                </td>`
                ).join('')}
              </tr>
            </table>`;
}

/**
 * @param {object} params
 * @param {string} params.headline
 * @param {string} params.bodyHtml   — admin-authored, already sanitised upstream
 * @param {string} [params.greetingName]
 * @param {string} [params.ctaLabel]
 * @param {string} [params.ctaUrl]
 * @param {boolean} [params.showRange]
 * @param {string} params.unsubscribeUrl
 */
export function newsletterEmailHtml({
  headline,
  bodyHtml,
  greetingName,
  ctaLabel,
  ctaUrl,
  showRange = true,
  unsubscribeUrl,
  preheader,
  heroSrc,
}) {
  const greeting = greetingName
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${brand.color};">Dear ${esc(greetingName)},</p>`
    : '';

  const cta =
    ctaLabel && ctaUrl
      ? `
          <tr>
            <td style="padding:8px 40px 36px;text-align:center;">
              <a href="${esc(ctaUrl)}"
                 style="display:inline-block;padding:14px 38px;background:${brand.accent};color:#ffffff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;">
                ${esc(ctaLabel)}
              </a>
            </td>
          </tr>`
      : '';

  const range = showRange
    ? `
          <tr>
            <td style="padding:8px 40px 32px;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#b8a99a;letter-spacing:2px;text-transform:uppercase;text-align:center;">
                Our range
              </p>
              ${rangeStrip()}
            </td>
          </tr>`
    : '';

  const body = `
          ${heroBlock(heroSrc, 'A Highland Yak Chew dog')}

          <tr>
            <td style="padding:32px 40px 8px;">
              <h2 style="margin:0 0 18px;font-size:24px;line-height:1.3;font-weight:800;color:${brand.color};">
                ${esc(headline)}
              </h2>
              ${greeting}
              <div style="font-size:15px;line-height:1.8;color:#5b4636;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          ${cta}
          ${range}`;

  return marketingLayout({
    title: headline,
    preheader: preheader || headline,
    bodyHtml: body,
    unsubscribeUrl,
  });
}

// ─── Plain-text alternatives ──────────────────────────────────────────────────
// Sent alongside the HTML as multipart/alternative. Two reasons: an HTML-only
// message is a measurable spam signal, and some clients (and every screen
// reader fallback) want real text rather than a tag-stripped approximation.

export function reviewRequestEmailText({ firstName, orderNumber, items, unsubscribeUrl }) {
  const name = (firstName || '').trim();
  const lines = [
    name ? `Dear ${name},` : 'Hello,',
    '',
    'Your order has landed and we hope it went down well. We are a small team in',
    'the UK sourcing every chew from the Himalayas, and honest feedback from real',
    'dog owners is genuinely how we decide what to make next.',
    '',
    `From order ${orderNumber}:`,
    '',
  ];

  for (const item of items) {
    lines.push(`  ${item.name}`);
    lines.push(`  Review it: ${item.reviewUrl}`);
    lines.push('');
  }

  lines.push(
    'A review takes about a minute, and there is no need to be polite about it —',
    'if something was not right, tell us and we will put it straight.',
    '',
    'Thank you for trusting us with your dog. It genuinely means a lot.',
    '',
    '— The Highland Yak Chew team',
    '',
    `${brand.name} · ${siteUrl()}`,
    `Questions? ${brand.supportEmail}`,
    `Unsubscribe: ${unsubscribeUrl}`,
  );

  return lines.join('\n');
}

export function newsletterEmailText({ headline, bodyHtml, greetingName, ctaLabel, ctaUrl, unsubscribeUrl }) {
  // The body is admin-authored HTML, so it gets converted rather than rewritten.
  const body = String(bodyHtml || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '  • ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = [headline, ''];
  if (greetingName) lines.push(`Dear ${greetingName},`, '');
  lines.push(body, '');
  if (ctaLabel && ctaUrl) lines.push(`${ctaLabel}: ${ctaUrl}`, '');
  lines.push(
    `${brand.name} · ${siteUrl()}`,
    `Questions? ${brand.supportEmail}`,
    `Unsubscribe: ${unsubscribeUrl}`,
  );

  return lines.join('\n');
}
