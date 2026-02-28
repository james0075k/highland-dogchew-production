import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

export const isCloudinaryConfigured =
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET &&
     process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name');

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] ✅ Cloud storage enabled — images backed up to Cloudinary CDN');
} else {
  console.log('[Cloudinary] ⚠️  Credentials not set — using local disk storage only');
}

export { cloudinary };
