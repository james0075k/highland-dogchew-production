import ProductModel from '../models/productModel.js';
import VarietyModel from '../models/varietyModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import path from 'path';
import fs from 'fs';
import { __dirname, deleteFile } from '../utils/fileHelpers.js';
import mongoose from 'mongoose';
import { productValidationSchema } from '../validations/productValidationSchemas.js';

// ─── Image URL helpers ───────────────────────────────────────────────────────

// Build a URL from an uploaded file.
// • Cloudinary: multer sets file.path = full https://res.cloudinary.com/... URL
// • Local disk:  file.path is an absolute local path, use filename instead
const getUploadedFileUrl = (file, req) => {
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path; // Cloudinary URL — works everywhere
  }
  return `${req.protocol}://${req.get('host')}${getFileUrl(file.filename)}`;
};

// Normalise a stored image URL so it always resolves correctly:
//   • Cloudinary URLs       → leave as-is  (CDN, accessible everywhere)
//   • Other absolute URLs   → leave as-is  (e.g. production server URLs still work)
//   • localhost/127 URLs    → rewrite to current host (localhost-only URLs break on prod)
//   • Relative /uploads/... → make absolute with current host
const rewriteImageUrl = (url, req) => {
  if (!url || typeof url !== 'string') return url;
  // Cloudinary — always universally accessible
  if (url.includes('res.cloudinary.com')) return url;
  // Relative path — make absolute
  if (url.startsWith('/uploads/')) {
    return `${req.protocol}://${req.get('host')}${url}`;
  }
  // Only rewrite localhost URLs — they only work on the machine that uploaded the file
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const idx = url.indexOf('/uploads/');
    if (idx === -1) return url;
    return `${req.protocol}://${req.get('host')}${url.substring(idx)}`;
  }
  // Any other absolute URL (e.g. https://api.highlanddogchew.co.uk/uploads/...) — leave as-is
  return url;
};

const rewriteProductImages = (product, req) => {
  const p = product.toObject ? product.toObject() : { ...product };
  p.image = rewriteImageUrl(p.image, req);
  if (Array.isArray(p.gallery)) {
    p.gallery = p.gallery.map(u => rewriteImageUrl(u, req));
  }
  return p;
};
// ─────────────────────────────────────────────────────────────────────────────

// Create Product
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, price, originalPrice, category, productType, variety, badge,
      description, features, sizes, bulkPricing, rating, reviews,
      pricingSettings, subscriptionSettings,
    } = req.body;

    // TEMP LOG: verify productType arrives from admin form
    console.log('[createProduct] productType received:', productType);

    // Validate productType — required, must be valid enum
    const allowedTypes = ['yak-milk', 'puff-treat', 'highland-mix'];
    if (!productType || !allowedTypes.includes(productType)) {
      return res.status(400).json({
        success: false,
        message: `productType is required and must be one of: ${allowedTypes.join(', ')}. Got: "${productType}"`,
      });
    }

    // Validate variety exists
    if (!variety) {
      return next(handleError(400, 'Variety is required'));
    }

    const varietyExists = await VarietyModel.findById(variety);
    if (!varietyExists) {
      return next(handleError(404, 'Selected variety does not exist'));
    }

    // Check for images
    if (!req.files || (!req.files.image && !req.files.gallery)) {
      return next(handleError(400, 'At least one image is required'));
    }

    // Handle main image
    let fullImageUrl = '';
    if (req.files.image && req.files.image[0]) {
      fullImageUrl = getUploadedFileUrl(req.files.image[0], req);
    } else if (req.files.gallery && req.files.gallery.length > 0) {
      fullImageUrl = getUploadedFileUrl(req.files.gallery[0], req);
    }

    // Handle gallery images
    let galleryUrls = [];
    if (req.files.gallery && req.files.gallery.length > 0) {
      galleryUrls = req.files.gallery.map(file => getUploadedFileUrl(file, req));
    }

    // Parse JSON strings
    const parsedFeatures = features ? JSON.parse(features) : [];
    const parsedSizes = sizes ? JSON.parse(sizes) : [];
    const parsedBulkPricing = bulkPricing ? JSON.parse(bulkPricing) : [];

    // Parse advanced pricing settings
    const parsedPricingSettings = pricingSettings
      ? (typeof pricingSettings === 'string' ? JSON.parse(pricingSettings) : pricingSettings)
      : {};
    const parsedSubscriptionSettings = subscriptionSettings
      ? (typeof subscriptionSettings === 'string' ? JSON.parse(subscriptionSettings) : subscriptionSettings)
      : {};

    // Validate pricing settings
    const taxPct = parseFloat(parsedPricingSettings.taxPercentage) || 0;
    const delCharge = parseFloat(parsedPricingSettings.deliveryCharge) || 0;
    if (taxPct < 0) return next(handleError(400, 'Tax percentage cannot be negative'));
    if (delCharge < 0) return next(handleError(400, 'Delivery charge cannot be negative'));

    const subDiscount = parseFloat(parsedSubscriptionSettings.discountPercentage) || 0;
    if (subDiscount < 0 || subDiscount > 100) {
      return next(handleError(400, 'Subscription discount must be between 0 and 100'));
    }

    // Build product data
    const productData = {
      name,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      category,
      productType,
      variety,
      badge: badge || null,
      description,
      features: parsedFeatures,
      sizes: parsedSizes,
      bulkPricing: parsedBulkPricing,
      rating: rating ? parseFloat(rating) : 0,
      reviews: reviews ? parseInt(reviews) : 0,
      image: fullImageUrl,
      gallery: galleryUrls,
      pricingSettings: {
        taxPercentage: taxPct,
        deliveryCharge: delCharge,
      },
      subscriptionSettings: {
        isEnabled: !!parsedSubscriptionSettings.isEnabled,
        discountPercentage: subDiscount,
        weeklyOptions: Array.isArray(parsedSubscriptionSettings.weeklyOptions)
          ? parsedSubscriptionSettings.weeklyOptions
          : [],
        monthlyOptions: Array.isArray(parsedSubscriptionSettings.monthlyOptions)
          ? parsedSubscriptionSettings.monthlyOptions
          : [],
        intervals: Array.isArray(parsedSubscriptionSettings.intervals)
          ? parsedSubscriptionSettings.intervals
          : [],
      },
    };

    // Save to DB
    const product = new ProductModel(productData);
    const savedProduct = await product.save();

    // Populate variety details in response
    await savedProduct.populate('variety');

    return handleSuccess(res, 201, 'Product created successfully', rewriteProductImages(savedProduct, req));
  } catch (error) {
    next(error);
  }
};

// Get All Products (with variety populated)
export const getAllProducts = async (req, res, next) => {
  try {
    const allowedTypes = ['yak-milk', 'puff-treat', 'highland-mix'];
    const filter = {};

    if (req.query.type) {
      if (!allowedTypes.includes(req.query.type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product type "${req.query.type}". Must be one of: ${allowedTypes.join(', ')}`,
        });
      }
      filter.productType = req.query.type;
    }

    const products = await ProductModel.find(filter)
      .populate('variety', 'name category')
      .sort({ createdAt: -1 });

    const rewritten = products.map(p => rewriteProductImages(p, req));
    return handleSuccess(res, 200, 'All products fetched successfully', rewritten);
  } catch (error) {
    next(error);
  }
};

// Get Product By Slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug }).populate('variety');

    if (!product) return next(handleError(404, 'Product not found'));

    return handleSuccess(res, 200, 'Product fetched successfully', rewriteProductImages(product, req));
  } catch (error) {
    next(error);
  }
};

// Get Product By ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(handleError(400, 'Invalid product ID'));
    }

    const product = await ProductModel.findById(id).populate('variety');

    if (!product) return next(handleError(404, 'Product not found'));

    return handleSuccess(res, 200, 'Product fetched successfully', rewriteProductImages(product, req));
  } catch (error) {
    next(error);
  }
};

// Get Products by Variety ID
export const getProductsByVariety = async (req, res, next) => {
  try {
    const { varietyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(varietyId)) {
      return next(handleError(400, 'Invalid variety ID'));
    }

    const products = await ProductModel.find({ variety: varietyId })
      .populate('variety')
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return next(handleError(404, 'No products found for this variety'));
    }

    return handleSuccess(res, 200, 'Products fetched by variety successfully', products.map(p => rewriteProductImages(p, req)));
  } catch (error) {
    next(error);
  }
};

// Update Product
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updatedData = { ...req.body };

    // Validate productType if provided
    const allowedTypes = ['yak-milk', 'puff-treat', 'highland-mix'];
    if (updatedData.productType && !allowedTypes.includes(updatedData.productType)) {
      return res.status(400).json({ success: false, message: 'Invalid productType' });
    }

    // Validate variety if provided
    if (updatedData.variety) {
      const varietyExists = await VarietyModel.findById(updatedData.variety);
      if (!varietyExists) {
        return next(handleError(404, 'Selected variety does not exist'));
      }
    }

    // Remove MongoDB internal fields
    if (updatedData._id) delete updatedData._id;
    if (updatedData.createdAt) delete updatedData.createdAt;
    if (updatedData.updatedAt) delete updatedData.updatedAt;
    if (updatedData.__v) delete updatedData.__v;

    // Parse JSON strings if they exist
    if (updatedData.features && typeof updatedData.features === 'string') {
      updatedData.features = JSON.parse(updatedData.features);
    }
    if (updatedData.sizes && typeof updatedData.sizes === 'string') {
      updatedData.sizes = JSON.parse(updatedData.sizes);
    }
    if (updatedData.bulkPricing && typeof updatedData.bulkPricing === 'string') {
      updatedData.bulkPricing = JSON.parse(updatedData.bulkPricing);
    }
    if (updatedData.gallery && typeof updatedData.gallery === 'string') {
      updatedData.gallery = JSON.parse(updatedData.gallery);
    }

    // Parse advanced pricing/subscription settings
    if (updatedData.pricingSettings && typeof updatedData.pricingSettings === 'string') {
      updatedData.pricingSettings = JSON.parse(updatedData.pricingSettings);
    }
    if (updatedData.subscriptionSettings && typeof updatedData.subscriptionSettings === 'string') {
      updatedData.subscriptionSettings = JSON.parse(updatedData.subscriptionSettings);
    }

    // Validate pricing settings if provided
    if (updatedData.pricingSettings) {
      const taxPct = parseFloat(updatedData.pricingSettings.taxPercentage) || 0;
      const delCharge = parseFloat(updatedData.pricingSettings.deliveryCharge) || 0;
      if (taxPct < 0) return next(handleError(400, 'Tax percentage cannot be negative'));
      if (delCharge < 0) return next(handleError(400, 'Delivery charge cannot be negative'));
      updatedData.pricingSettings = { taxPercentage: taxPct, deliveryCharge: delCharge };
    }

    // Fix subscriptionSettings — preserve weeklyOptions and monthlyOptions
    if (updatedData.subscriptionSettings) {
      const subDiscount = parseFloat(updatedData.subscriptionSettings.discountPercentage) || 0;
      if (subDiscount < 0 || subDiscount > 100) {
        return next(handleError(400, 'Subscription discount must be between 0 and 100'));
      }
      updatedData.subscriptionSettings = {
        isEnabled: !!updatedData.subscriptionSettings.isEnabled,
        discountPercentage: subDiscount,
        weeklyOptions: Array.isArray(updatedData.subscriptionSettings.weeklyOptions)
          ? updatedData.subscriptionSettings.weeklyOptions
          : [],
        monthlyOptions: Array.isArray(updatedData.subscriptionSettings.monthlyOptions)
          ? updatedData.subscriptionSettings.monthlyOptions
          : [],
        intervals: Array.isArray(updatedData.subscriptionSettings.intervals)
          ? updatedData.subscriptionSettings.intervals
          : [],
      };
    }

    // Convert numeric strings to numbers
    if (updatedData.price) updatedData.price = parseFloat(updatedData.price);
    if (updatedData.originalPrice) updatedData.originalPrice = parseFloat(updatedData.originalPrice);
    if (updatedData.rating) updatedData.rating = parseFloat(updatedData.rating);
    if (updatedData.reviews) updatedData.reviews = parseInt(updatedData.reviews);

    // Handle main image update
    if (req.files?.image && req.files.image[0]) {
      updatedData.image = getUploadedFileUrl(req.files.image[0], req);
    } else if (req.file) {
      updatedData.image = getUploadedFileUrl(req.file, req);
    }

    // Handle gallery update
    // Frontend sends existingGallery (JSON array of URLs to keep) + any new gallery files
    if (req.files?.gallery && req.files.gallery.length > 0) {
      const newGalleryUrls = req.files.gallery.map(file => getUploadedFileUrl(file, req));

      let existingGallery = [];
      if (updatedData.existingGallery) {
        try { existingGallery = JSON.parse(updatedData.existingGallery); } catch {}
        delete updatedData.existingGallery;
      }
      updatedData.gallery = [...existingGallery, ...newGalleryUrls];
    } else if (updatedData.existingGallery) {
      // No new files uploaded — use the existing gallery list (may have had items removed)
      try { updatedData.gallery = JSON.parse(updatedData.existingGallery); } catch {}
      delete updatedData.existingGallery;
    }

    // Update the product document
    const updated = await ProductModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).populate('variety');

    if (!updated) {
      return next(handleError(404, 'Product not found'));
    }

    return handleSuccess(res, 200, 'Product updated successfully', rewriteProductImages(updated, req));
  } catch (error) {
    next(error);
  }
};

// Delete Product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) return next(handleError(404, 'Product not found'));

    // Delete main product image
    const imageUrl = deletedProduct.image;
    const imageName = imageUrl?.split('/uploads/')[1];

    if (imageName) {
      const imagePath = path.join(__dirname, '../../uploads', imageName);

      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
        console.log('Product image deleted:', imagePath);
      }
    }

    // Delete gallery images if any
    if (deletedProduct.gallery && deletedProduct.gallery.length > 0) {
      for (const galleryUrl of deletedProduct.gallery) {
        const galleryImageName = galleryUrl?.split('/uploads/')[1];
        if (galleryImageName) {
          const galleryImagePath = path.join(__dirname, '../../uploads', galleryImageName);
          if (fs.existsSync(galleryImagePath)) {
            await deleteFile(galleryImagePath);
            console.log('Gallery image deleted:', galleryImagePath);
          }
        }
      }
    }

    return handleSuccess(res, 200, 'Product and images deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get Products by Category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const products = await ProductModel.find({ category })
      .populate('variety')
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return next(handleError(404, 'No products found for this category'));
    }

    return handleSuccess(res, 200, 'Products fetched by category successfully', products.map(p => rewriteProductImages(p, req)));
  } catch (error) {
    next(error);
  }
};

// Get Products by Product Type (yak-milk, puff-treat, highland-mix)
export const getProductsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const allowedTypes = ['yak-milk', 'puff-treat', 'highland-mix'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid product type "${type}". Must be one of: ${allowedTypes.join(', ')}`,
      });
    }

    const products = await ProductModel.find({ productType: type })
      .populate('variety')
      .lean()
      .sort({ createdAt: -1 });

    const rewritten = products.map(p => rewriteProductImages(p, req));
    return handleSuccess(res, 200, 'Products fetched by type successfully', rewritten);
  } catch (error) {
    next(error);
  }
};

// Get Featured Products (with badge)
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await ProductModel.find({
      badge: { $ne: null, $exists: true }
    })
    .populate('variety')
    .sort({ createdAt: -1 });

    return handleSuccess(res, 200, 'Featured products fetched successfully', products.map(p => rewriteProductImages(p, req)));
  } catch (error) {
    next(error);
  }
};
