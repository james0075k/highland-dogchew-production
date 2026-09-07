/**
 * Generates email-safe copies of the photos used in marketing email.
 *
 * Why this exists: public/images/dog-*.webp cannot be used in email. Outlook on
 * Windows renders WebP as a broken-image box, and it is still a large share of
 * UK inboxes — so every image an email references has to be JPEG.
 *
 * Also resizes: an inbox does not need a 1600px original, and mailbox providers
 * clip messages that get too heavy.
 *
 * Run after changing the source photos:
 *   node scripts/build-email-images.mjs
 */
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_IMAGES = path.join(process.cwd(), 'public', 'images');
const OUT_DIR = path.join(PUBLIC_IMAGES, 'email');

// The backend embeds these into outgoing mail as CID attachments, so it needs
// its own copy on disk — it can't reach the frontend's public folder.
const BACKEND_ASSETS = path.join(process.cwd(), '..', 'FusionBackend-main', 'assets', 'email');

// Chosen for warm, brand-matching tones and — importantly — no photographer
// watermark. dog-12.webp is watermarked and must not be used in marketing.
const JOBS = [
  { src: 'dog-20.webp', out: 'review-hero.jpg', width: 1200 },
  { src: 'dog-1.webp', out: 'newsletter-hero.jpg', width: 1200 },
];

await mkdir(OUT_DIR, { recursive: true });
await mkdir(BACKEND_ASSETS, { recursive: true });

for (const job of JOBS) {
  const from = path.join(PUBLIC_IMAGES, job.src);
  const to = path.join(OUT_DIR, job.out);

  const info = await sharp(from)
    .resize({ width: job.width, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(to);

  await copyFile(to, path.join(BACKEND_ASSETS, job.out));

  console.log(`${job.src} -> images/email/${job.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

console.log('\nEmail images written to public/images/email/ and copied to the backend assets/email/');
