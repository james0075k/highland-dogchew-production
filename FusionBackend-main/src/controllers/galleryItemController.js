import GalleryItemModel from '../models/galleryItemModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import path from 'path';
import fs from 'fs';

// â”€â”€â”€ Image URL helpers (same pattern as instagramPostController) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getUploadedFileUrl = (file, req) => {
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
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

// GET all active items (public â€” sorted by order then newest)
export const getGalleryItems = async (req, res, next) => {
  try {
    const items = await GalleryItemModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    const rewritten = items.map(i => ({ ...i, image: rewriteImageUrl(i.image, req) }));
    return handleSuccess(res, 200, 'Gallery items fetched', rewritten);
  } catch (err) {
    next(err);
  }
};

// GET all items including inactive (admin)
export const getGalleryItemsAdmin = async (req, res, next) => {
  try {
    const items = await GalleryItemModel.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    const rewritten = items.map(i => ({ ...i, image: rewriteImageUrl(i.image, req) }));
    return handleSuccess(res, 200, 'All gallery items fetched', rewritten);
  } catch (err) {
    next(err);
  }
};

// POST create
export const createGalleryItem = async (req, res, next) => {
  try {
    const { title, description, category, order, isActive } = req.body;

    if (!req.file) return next(handleError(400, 'Image is required'));
    if (!title)    return next(handleError(400, 'Title is required'));

    const item = new GalleryItemModel({
      image:       getUploadedFileUrl(req.file, req),
      title:       title.trim(),
      description: (description || '').trim(),
      category:    category || 'GALLERY',
      order:       order ? parseInt(order) : 0,
      isActive:    isActive !== undefined ? isActive === 'true' || isActive === true : true,
    });

    const saved = await item.save();
    return handleSuccess(res, 201, 'Gallery item created', saved);
  } catch (err) {
    next(err);
  }
};

// PUT update
export const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, order, isActive } = req.body;

    const item = await GalleryItemModel.findById(id);
    if (!item) return next(handleError(404, 'Gallery item not found'));

    if (title       !== undefined) item.title       = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (category    !== undefined) item.category    = category;
    if (order       !== undefined) item.order       = parseInt(order);
    if (isActive    !== undefined) item.isActive    = isActive === 'true' || isActive === true;

    if (req.file) {
      await deleteLocalFile(item.image);
      item.image = getUploadedFileUrl(req.file, req);
    }

    const updated = await item.save();
    const result  = updated.toObject();
    result.image  = rewriteImageUrl(result.image, req);
    return handleSuccess(res, 200, 'Gallery item updated', result);
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteGalleryItem = async (req, res, next) => {
  try {
    const deleted = await GalleryItemModel.findByIdAndDelete(req.params.id);
    if (!deleted) return next(handleError(404, 'Gallery item not found'));
    await deleteLocalFile(deleted.image);
    return handleSuccess(res, 200, 'Gallery item deleted');
  } catch (err) {
    next(err);
  }
};
