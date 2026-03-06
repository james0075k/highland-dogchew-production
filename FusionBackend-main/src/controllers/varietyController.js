import VarietyModel from '../models/varietyModel.js';
import ProductModel from '../models/productModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import path from 'path';
import fs from 'fs';
import { __dirname, deleteFile } from '../utils/fileHelpers.js';
import mongoose from 'mongoose';

// ─── Image URL helpers (mirrors instagramPostController pattern) ──────────────

const getUploadedFileUrl = (file, req) => {
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path; // Cloudinary URL — works everywhere
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

// ─────────────────────────────────────────────────────────────────────────────

// Create Variety
export const createVariety = async (req, res, next) => {
  try {
    const { name, description, category, displayOrder } = req.body;

    if (!req.file) {
      return next(handleError(400, 'Variety image is required'));
    }

    const fullImageUrl = getUploadedFileUrl(req.file, req);

    const varietyData = {
      name,
      description,
      category,
      image: fullImageUrl,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    };

    const variety = new VarietyModel(varietyData);
    const savedVariety = await variety.save();

    return handleSuccess(res, 201, 'Variety created successfully', savedVariety);
  } catch (error) {
    next(error);
  }
};

// Get All Varieties
export const getAllVarieties = async (req, res, next) => {
  try {
    const varieties = await VarietyModel.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    const rewritten = varieties.map(v => ({ ...v, image: rewriteImageUrl(v.image, req) }));
    return handleSuccess(res, 200, 'All varieties fetched successfully', rewritten);
  } catch (error) {
    next(error);
  }
};

// Get Variety By Slug
export const getVarietyBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const variety = await VarietyModel.findOne({ slug, isActive: true }).lean();

    if (!variety) return next(handleError(404, 'Variety not found'));

    return handleSuccess(res, 200, 'Variety fetched successfully', { ...variety, image: rewriteImageUrl(variety.image, req) });
  } catch (error) {
    next(error);
  }
};

// Get Variety By ID
export const getVarietyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(handleError(400, 'Invalid variety ID'));
    }

    const variety = await VarietyModel.findById(id).lean();

    if (!variety) return next(handleError(404, 'Variety not found'));

    return handleSuccess(res, 200, 'Variety fetched successfully', { ...variety, image: rewriteImageUrl(variety.image, req) });
  } catch (error) {
    next(error);
  }
};

// Get Varieties By Category
export const getVarietiesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const varieties = await VarietyModel.find({
      category,
      isActive: true,
    }).sort({ displayOrder: 1, createdAt: -1 }).lean();

    if (!varieties || varieties.length === 0) {
      return next(handleError(404, 'No varieties found for this category'));
    }

    const rewritten = varieties.map(v => ({ ...v, image: rewriteImageUrl(v.image, req) }));
    return handleSuccess(res, 200, 'Varieties fetched by category successfully', rewritten);
  } catch (error) {
    next(error);
  }
};

// Update Variety
export const updateVariety = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updatedData = { ...req.body };

    // Remove MongoDB internal fields
    if (updatedData._id) delete updatedData._id;
    if (updatedData.createdAt) delete updatedData.createdAt;
    if (updatedData.updatedAt) delete updatedData.updatedAt;
    if (updatedData.__v) delete updatedData.__v;

    if (updatedData.displayOrder) updatedData.displayOrder = parseInt(updatedData.displayOrder);

    if (req.file) {
      updatedData.image = getUploadedFileUrl(req.file, req);
    }

    const updated = await VarietyModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return next(handleError(404, 'Variety not found'));
    }

    return handleSuccess(res, 200, 'Variety updated successfully', { ...updated, image: rewriteImageUrl(updated.image, req) });
  } catch (error) {
    next(error);
  }
};

// Delete Variety
export const deleteVariety = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedVariety = await VarietyModel.findByIdAndDelete(id);

    if (!deletedVariety) return next(handleError(404, 'Variety not found'));

    await deleteLocalFile(deletedVariety.image);

    return handleSuccess(res, 200, 'Variety and image deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Toggle Variety Active Status
export const toggleVarietyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const variety = await VarietyModel.findById(id);
    if (!variety) return next(handleError(404, 'Variety not found'));

    variety.isActive = !variety.isActive;
    await variety.save();

    return handleSuccess(res, 200, 'Variety status updated successfully', variety);
  } catch (error) {
    next(error);
  }
};

// Get Variety with its Products
export const getVarietyWithProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(handleError(400, 'Invalid variety ID'));
    }

    const variety = await VarietyModel.findById(id).lean();
    if (!variety) return next(handleError(404, 'Variety not found'));

    const products = await ProductModel.find({ variety: id }).sort({ createdAt: -1 });

    const result = {
      ...variety,
      image: rewriteImageUrl(variety.image, req),
      products,
      productCount: products.length,
    };

    return handleSuccess(res, 200, 'Variety with products fetched successfully', result);
  } catch (error) {
    next(error);
  }
};
