/**
 * Hero images for marketing email, embedded rather than linked.
 *
 * Why not just link to https://site/images/email/hero.jpg: a linked image only
 * works once the frontend carrying that file is deployed, and it stays broken
 * in every message already sitting in someone's inbox if the path ever moves.
 * Embedding as a CID attachment makes the image part of the message, so it
 * renders with no dependency on the website being up, deployed, or reachable.
 *
 * The admin preview can't use cid: (it's an iframe, not a mail client), so the
 * same file is offered as a data: URI there.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from './logger.js';

const log = logger.child({ component: 'emailAssets' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = path.join(__dirname, '..', '..', 'assets', 'email');

export const HEROES = {
  review: { file: 'review-hero.jpg', cid: 'hero@highlandyakchew', type: 'image/jpeg' },
  newsletter: { file: 'newsletter-hero.jpg', cid: 'hero@highlandyakchew', type: 'image/jpeg' },
  // PNG, not JPEG: the mark sits on the dark header and needs its transparency.
  logo: { file: 'logo-mark.png', cid: 'logo@highlandyakchew', type: 'image/png' },
};

// Read once per process — these are a few hundred KB and never change at runtime.
const cache = new Map();

function readHero(kind) {
  if (cache.has(kind)) return cache.get(kind);

  const hero = HEROES[kind];
  let buffer = null;
  try {
    buffer = fs.readFileSync(path.join(ASSET_DIR, hero.file));
  } catch (err) {
    // Not fatal: the email still sends, just without its hero. Far better than
    // failing a whole campaign because one decorative image is missing.
    log.error({ err, file: hero.file }, 'Email hero image missing — sending without it');
  }
  cache.set(kind, buffer);
  return buffer;
}

/** Attachment array for sendEmail, or [] when the file isn't available. */
export function heroAttachment(kind) {
  const buffer = readHero(kind);
  if (!buffer) return [];
  const hero = HEROES[kind];
  return [{
    filename: hero.file,
    content: buffer,
    cid: hero.cid,
    contentType: hero.type,
    contentDisposition: 'inline',
  }];
}

/** What the template should put in <img src>. Null when there's no image. */
export function heroSrc(kind) {
  return readHero(kind) ? `cid:${HEROES[kind].cid}` : null;
}

/** Same image as a data: URI, for the admin preview iframe. */
export function heroDataUri(kind) {
  const buffer = readHero(kind);
  if (!buffer) return null;
  return `data:${HEROES[kind].type};base64,${buffer.toString('base64')}`;
}

/**
 * Every image a marketing email needs: the header logo plus its hero.
 * Returned together so a caller can't accidentally attach one and not the other.
 */
export function emailAttachments(kind) {
  return [...heroAttachment('logo'), ...heroAttachment(kind)];
}
