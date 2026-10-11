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

// Our own photos from the @highlandyakchew Instagram export, so the email shows
// the actual product. (The old stock dog-*.webp sources are not ours to use —
// dog-12.webp even carries a photographer watermark.)
// `height` + `position` crop to a fixed shape; omit them to keep the source ratio.
const JOBS = [
  { src: 'blog/are-yak-chews-safe-dog-chewing-highland-yak-chew.webp', out: 'review-hero.jpg', width: 1200, height: 800, position: 'north' },
  { src: 'blog/yak-chew-ingredients-yak-cow-milk-natural-flavours.webp', out: 'newsletter-hero.jpg', width: 1200, height: 600, position: 'centre' },
];

// Category cards: shown on /products and linked (not embedded) by the
// newsletter's range strip, so they live in public/images and must stay JPEG.
// Keep the old *-category.jpg files: newsletters already sent still link to them.
const CATEGORY_JOBS = [
  { src: 'blog/yak-milk-dog-chews-original-strawberry-blueberry-turmeric.webp', out: 'yak-milk-chews-four-flavours.jpg', position: 'centre' },
  { src: 'blog/crunchy-puffed-yak-chew-treats-pouch.webp', out: 'puff-treats-crunchy-puff-chew-pouch.jpg', position: 'south' },
  { src: 'blog/highland-gift-box-yak-chews-puff-treats.webp', out: 'highland-mix-gift-box-range.jpg', position: 'south' },
];

// The header logo is handled separately: it must stay PNG, because it sits on
// the dark brown header and needs its transparency. JPEG would box it in white.
// logo11.png carries the wordmark baked in, so only the mountain mark is taken —
// the "Highland Yak Chew" wordmark is live text in the email, which keeps the
// branding readable when a client blocks images.
const LOGO = {
  src: 'logo11.png',
  out: 'logo-mark.png',
  crop: { left: 60, top: 78, width: 380, height: 168 },
  width: 560, // 2x the 280px display width, for retina
};

await mkdir(OUT_DIR, { recursive: true });
await mkdir(BACKEND_ASSETS, { recursive: true });

for (const job of JOBS) {
  const from = path.join(PUBLIC_IMAGES, job.src);
  const to = path.join(OUT_DIR, job.out);

  const info = await sharp(from)
    .resize(job.height
      ? { width: job.width, height: job.height, fit: 'cover', position: job.position }
      : { width: job.width, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(to);

  await copyFile(to, path.join(BACKEND_ASSETS, job.out));

  console.log(`${job.src} -> images/email/${job.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

for (const job of CATEGORY_JOBS) {
  const info = await sharp(path.join(PUBLIC_IMAGES, job.src))
    .resize({ width: 800, height: 600, fit: 'cover', position: job.position })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(path.join(PUBLIC_IMAGES, job.out));

  console.log(`${job.src} -> images/${job.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

{
  const from = path.join(PUBLIC_IMAGES, LOGO.src);
  const to = path.join(OUT_DIR, LOGO.out);

  const info = await sharp(from)
    .extract(LOGO.crop)
    .resize({ width: LOGO.width })
    .png({ compressionLevel: 9 })
    .toFile(to);

  await copyFile(to, path.join(BACKEND_ASSETS, LOGO.out));
  console.log(`${LOGO.src} -> images/email/${LOGO.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB (transparent)`);
}

console.log('\nEmail images written to public/images/email/ and copied to the backend assets/email/');
