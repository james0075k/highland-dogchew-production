import HeroBanner from "../models/heroBannerModel.js";
import handleError from "../utils/errorHandler.js";
import handleSuccess from "../utils/successHandler.js";
import { getFileUrl } from "../middlewares/MulterMiddleware/multerMiddleware.js";
import fs from "fs";
import path from "path";
import { deleteFile, __dirname } from "../utils/fileHelpers.js";

// â”€â”€â”€ Image URL helpers (mirrors instagramPostController pattern) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getUploadedFileUrl = (file, req) => {
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path; // Cloudinary URL â€” works everywhere
  }
  return `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`;
};

const rewriteImageUrl = (url, req) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com')) return url;
  if (url.startsWith('/uploads/')) return `${req.protocol}://${req.get('host')}${url}`;
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const idx = url.indexOf('/uploads/');
    if (idx === -1) return url;
    return `${req.protocol}://${req.get('host')}${url.substring(idx)}`;
  }
  return url;
};

const deleteLocalFile = async (imageUrl) => {
  if (!imageUrl || imageUrl.includes('res.cloudinary.com')) return;
  const imageName = imageUrl.split('/uploads/')[1];
  if (!imageName) return;
  const imagePath = path.join(__dirname, '../../uploads', imageName);
  if (fs.existsSync(imagePath)) await deleteFile(imagePath);
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Create Hero Banner
export const createHeroBanner = async (req, res, next) => {
  try {
    const { page, title, subTitle, description, buttonText, buttonLink, height, width } = req.body;

    if (!req.file) {
      return next(handleError(400, "Banner image is required"));
    }

    const fullImageUrl = getUploadedFileUrl(req.file, req);

    // Remove existing banner for the same page
    const existingBanner = await HeroBanner.findOne({ page });
    if (existingBanner) {
      // Only attempt local disk deletion â€” Cloudinary files are skipped automatically
      await deleteLocalFile(existingBanner.bannerImage);
      await HeroBanner.deleteOne({ _id: existingBanner._id });
    }

    const newBanner = new HeroBanner({
      page,
      title,
      subTitle,
      description,
      buttonText,
      buttonLink,
      bannerImage: fullImageUrl,
      height,
      width,
    });

    const savedBanner = await newBanner.save();
    return handleSuccess(res, 201, "Successfully created new banner", savedBanner);
  } catch (err) {
    console.error(err);
    return next(handleError(500, "Failed to create banner"));
  }
};

// Read Banner by Page
export const readBannerByPage = async (req, res, next) => {
  try {
    const { page } = req.params;
    const banner = await HeroBanner.findOne({ page }).lean();

    if (!banner) return next(handleError(404, "Banner not found for this page"));

    return handleSuccess(res, 200, "Banner fetched", { ...banner, bannerImage: rewriteImageUrl(banner.bannerImage, req) });
  } catch (err) {
    return next(handleError(500, "Failed to fetch banner"));
  }
};

// Update Banner
export const updateHeroBanner = async (req, res, next) => {
  try {
    const { page } = req.params;
    const { title, subTitle, description, buttonText, buttonLink, height, width } = req.body;

    const banner = await HeroBanner.findOne({ page });
    if (!banner) return next(handleError(404, "Banner not found"));

    banner.title = title || banner.title;
    banner.subTitle = subTitle || banner.subTitle;
    banner.description = description || banner.description;
    banner.buttonText = buttonText || banner.buttonText;
    banner.buttonLink = buttonLink || banner.buttonLink;
    banner.height = height || banner.height;
    banner.width = width || banner.width;

    if (req.file) {
      // Delete old local file only â€” skip if Cloudinary
      await deleteLocalFile(banner.bannerImage);
      banner.bannerImage = getUploadedFileUrl(req.file, req);
    }

    const updated = await banner.save();
    const result = updated.toObject();
    result.bannerImage = rewriteImageUrl(result.bannerImage, req);
    return handleSuccess(res, 200, "Hero banner updated", result);
  } catch (err) {
    console.error(err);
    return next(handleError(500, "Update failed"));
  }
};

// Delete Banner (with image)
export const deleteHeroBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (!banner) return next(handleError(404, "Banner not found"));

    // Only attempt local disk deletion â€” Cloudinary files are skipped automatically
    await deleteLocalFile(banner.bannerImage);

    return handleSuccess(res, 200, "Banner and image deleted successfully", banner);
  } catch (err) {
    return next(handleError(500, "Unable to delete banner"));
  }
};
