import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promisify } from 'util';
import { isCloudinaryConfigured, cloudinary } from '../../config/cloudinaryConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Local disk storage (always available as fallback) ────────────────────────
const ensureUploadsDir = async () => {
  const uploadPath = path.join(__dirname, '../../../uploads');
  try {
    await promisify(fs.access)(uploadPath);
  } catch {
    await promisify(fs.mkdir)(uploadPath, { recursive: true });
  }
};

const diskStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await ensureUploadsDir();
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// ─── Smart storage: disk-first, then Cloudinary ───────────────────────────────
// Strategy:
//   1. Always save to local disk first  →  image is ALWAYS available locally
//   2. If Cloudinary is configured, try uploading the saved file to CDN
//   3. Cloudinary succeeds  → delete local copy, return CDN URL
//   4. Cloudinary fails     → keep local copy, return local URL (site still works)
const smartStorage = {
  _handleFile(req, file, cb) {
    // Step 1 — save to disk (guaranteed)
    diskStorage._handleFile(req, file, (diskErr, diskInfo) => {
      if (diskErr) return cb(diskErr);

      // If Cloudinary is not configured, use disk result immediately
      if (!isCloudinaryConfigured) {
        return cb(null, diskInfo);
      }

      // Step 2 — try Cloudinary upload from the saved disk file
      cloudinary.uploader.upload(diskInfo.path, {
        folder: 'highland-dogchew/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
        ],
      })
        .then((result) => {
          // Step 3 — Cloudinary succeeded: remove local copy, return CDN info
          fs.unlink(diskInfo.path, () => {}); // non-blocking cleanup
          cb(null, {
            fieldname:    diskInfo.fieldname,
            originalname: diskInfo.originalname,
            encoding:     diskInfo.encoding,
            mimetype:     diskInfo.mimetype,
            path:         result.secure_url,  // https://res.cloudinary.com/...
            size:         result.bytes,
            filename:     result.public_id,
          });
        })
        .catch((cloudErr) => {
          // Cloudinary failed — keep disk file, site continues working locally
          console.warn('[Cloudinary] Upload failed, serving from local disk:', cloudErr.message);
          cb(null, diskInfo);
        });
    });
  },

  _removeFile(req, file, cb) {
    if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
      // Cloudinary file — nothing to remove locally
      cb(null);
    } else {
      diskStorage._removeFile(req, file, cb);
    }
  },
};

// ─── File filter ──────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// ─── Multer config ────────────────────────────────────────────────────────────
const baseMulterConfig = {
  storage: smartStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 20,
    fieldSize: 100 * 1024 * 1024,
    fieldNameSize: 500,
    fields: 100,
  },
};

// ─── Middleware factory functions ─────────────────────────────────────────────
export const singleUpload = (fieldName) => multer(baseMulterConfig).single(fieldName);

export const arrayUpload = (fieldName, maxCount) =>
  multer(baseMulterConfig).array(fieldName, maxCount);

export const fieldsUpload = (fieldsConfig) =>
  multer(baseMulterConfig).fields(fieldsConfig);

// ─── URL helper ───────────────────────────────────────────────────────────────
// For local disk storage only. Returns relative path like /uploads/filename.ext
export const getFileUrl = (filename) => `/uploads/${filename}`;
