/**
 * The one definition of the Highland Yak Chew email masthead.
 *
 * Shared by emailTemplates.js (receipts, subscriptions, admin alerts) and
 * marketingTemplates.js (review requests, newsletter) so a customer sees the
 * same header whatever we send them — and so changing the brand means editing
 * one file rather than hunting through fifteen templates.
 */

import { heroSrc } from './emailAssets.js';

export const brand = {
  name: 'Highland Yak Chew',
  color: '#2f1e14',
  accent: '#d97706',
  cream: '#f5f0e8',
  supportEmail: 'admin@highlanddogchew.co.uk',
};

// The site sets its wordmark in DM Serif Display. Web fonts don't load in
// Outlook or the Gmail apps, so email uses a stack that degrades predictably —
// Georgia is metrically close and present on every platform.
export const SERIF = "Georgia, 'Times New Roman', 'Playfair Display', serif";

/** The logo is attached by sendEmail whenever this cid appears in the HTML. */
export const LOGO_CID = 'logo@highlandyakchew';

/**
 * Masthead cell: mountain mark above the wordmark, matching the site header.
 *
 * The wordmark stays live text rather than being baked into the image, because
 * most clients block images by default — Outlook always does until you click.
 * With text, a reader who never loads images still sees the brand.
 */
export function masthead() {
  // Only reference the image if the file is actually on disk; otherwise the
  // header would show a broken-image box above the wordmark.
  const mark = heroSrc('logo')
    ? `<img src="cid:${LOGO_CID}" width="76" alt=""
           style="display:block;width:76px;height:auto;border:0;margin:0 auto 10px;" />`
    : '';

  return `
            <td style="background:${brand.color};padding:28px 40px 26px;text-align:center;">
              ${mark}
              <h1 style="margin:0;color:#ffffff;font-family:${SERIF};font-size:26px;font-weight:400;letter-spacing:0.02em;line-height:1.2;">
                ${brand.name}
              </h1>
            </td>`;
}
