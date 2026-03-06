import InstagramPostModel from '../models/instagramPostModel.js';
import handleError from '../utils/errorHandler.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import handleSuccess from '../utils/sucessHandler.js';
import path from 'path';
import fs from 'fs';

// ─── Image URL helpers (mirrors productController pattern) ───────────────────

// Resolve the correct URL from an uploaded file:
// - If Cloudinary succeeded, req.file.path is already https://res.cloudinary.com/...
// - If local disk, construct absolute URL from filename
const getUploadedFileUrl = (file, req) => {
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path; // Cloudinary URL — works everywhere
  }
  return `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`;
};

// Rewrite a stored image URL so it resolves correctly on the current host:
// - Cloudinary URLs → unchanged
// - localhost/127 URLs → rewritten to current host (fixes dev URLs in production)
// - Relative /uploads/... → made absolute with current host
// - Other absolute URLs → unchanged
const rewriteImageUrl = (url, req) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com')) return url;
  if (url.startsWith('/uploads/')) {
    return `${req.protocol}://${req.get('host')}${url}`;
  }
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const idx = url.indexOf('/uploads/');
    if (idx === -1) return url;
    return `${req.protocol}://${req.get('host')}${url.substring(idx)}`;
  }
  return url;
};

// Delete a local disk file only — skip if it is a Cloudinary URL
const deleteLocalFile = async (imageUrl) => {
  if (!imageUrl || imageUrl.includes('res.cloudinary.com')) return;
  const imageName = imageUrl.split('/uploads/')[1];
  if (!imageName) return;
  const imagePath = path.join(__dirname, '../../uploads', imageName);
  if (fs.existsSync(imagePath)) {
    await deleteFile(imagePath);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

// Create a new Instagram post
export const createInstagramPost = async (req, res, next) => {
  try {
    const { caption, instagramLink, type, order, isActive } = req.body;

    if (!req.file) {
      return next(handleError(400, 'Post image is required'));
    }

    // Correctly handles both Cloudinary and local disk uploads
    const fullImageUrl = getUploadedFileUrl(req.file, req);

    const newPost = new InstagramPostModel({
      image: fullImageUrl,
      caption,
      instagramLink,
      type: type || 'photo',
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    });

    const saved = await newPost.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

// Get all active posts (public — sorted by order, then newest first)
export const getAllInstagramPosts = async (req, res, next) => {
  try {
    const posts = await InstagramPostModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    const rewritten = posts.map(p => ({ ...p, image: rewriteImageUrl(p.image, req) }));
    res.status(200).json({ success: true, data: rewritten });
  } catch (error) {
    next(error);
  }
};

// Get ALL posts (admin — includes inactive)
export const getAllInstagramPostsAdmin = async (req, res, next) => {
  try {
    const posts = await InstagramPostModel.find().sort({ order: 1, createdAt: -1 }).lean();
    const rewritten = posts.map(p => ({ ...p, image: rewriteImageUrl(p.image, req) }));
    res.status(200).json({ success: true, data: rewritten });
  } catch (error) {
    next(error);
  }
};

// Get a single post by ID
export const getInstagramPostById = async (req, res, next) => {
  try {
    const post = await InstagramPostModel.findById(req.params.id).lean();
    if (!post) return next(handleError(404, 'Instagram post not found'));
    res.status(200).json({ success: true, data: { ...post, image: rewriteImageUrl(post.image, req) } });
  } catch (error) {
    next(error);
  }
};

// Update a post
export const updateInstagramPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { caption, instagramLink, type, order, isActive } = req.body;

    const post = await InstagramPostModel.findById(id);
    if (!post) return next(handleError(404, 'Instagram post not found'));

    if (caption !== undefined) post.caption = caption;
    if (instagramLink !== undefined) post.instagramLink = instagramLink;
    if (type !== undefined) post.type = type;
    if (order !== undefined) post.order = parseInt(order);
    if (isActive !== undefined) post.isActive = isActive === 'true' || isActive === true;

    // Handle image replacement — delete old local file (skip if Cloudinary), store new URL correctly
    if (req.file) {
      await deleteLocalFile(post.image);
      post.image = getUploadedFileUrl(req.file, req);
    }

    const updated = await post.save();
    const result = updated.toObject();
    result.image = rewriteImageUrl(result.image, req);
    return handleSuccess(res, 200, 'Instagram post updated successfully', result);
  } catch (error) {
    next(error);
  }
};

// Delete a post
export const deleteInstagramPost = async (req, res, next) => {
  try {
    const deleted = await InstagramPostModel.findByIdAndDelete(req.params.id);
    if (!deleted) return next(handleError(404, 'Instagram post not found'));

    // Only attempt local disk deletion — Cloudinary files are skipped automatically
    await deleteLocalFile(deleted.image);

    res.status(200).json({ success: true, message: 'Instagram post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
