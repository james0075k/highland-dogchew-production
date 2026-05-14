import TestimonialModel from '../models/testimonialModel.js';
import handleError from '../utils/errorHandler.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import handleSuccess from '../utils/successHandler.js';
import path from 'path';
import fs from 'fs';

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

// Create a new testimonial
export const createTestimonial = async (req, res, next) => {
  try {
    const { rating, message, name, location, position } = req.body;

    if (!req.file) {
      return next(handleError(400, 'Profile image is required'));
    }

    const fullImageUrl = getUploadedFileUrl(req.file, req);

    const newTestimonial = new TestimonialModel({
      rating,
      message,
      name,
      location,
      position,
      profileImage: fullImageUrl,
    });

    const savedTestimonial = await newTestimonial.save();
    res.status(201).json(savedTestimonial);
  } catch (error) {
    next(error);
  }
};

// Get all testimonials
export const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await TestimonialModel.find().sort({ createdAt: -1 }).lean();
    const rewritten = testimonials.map(t => ({ ...t, profileImage: rewriteImageUrl(t.profileImage, req) }));
    res.status(200).json(rewritten);
  } catch (error) {
    next(error);
  }
};

// Get a single testimonial by ID
export const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await TestimonialModel.findById(req.params.id).lean();
    if (!testimonial) return next(handleError(404, 'Testimonial not found'));
    res.status(200).json({ ...testimonial, profileImage: rewriteImageUrl(testimonial.profileImage, req) });
  } catch (error) {
    next(error);
  }
};

// Update a testimonial
export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, message, position, rating, location } = req.body;

    const testimonial = await TestimonialModel.findById(id);
    if (!testimonial) {
      return next(handleError(404, 'Testimonial not found'));
    }

    if (name) testimonial.name = name;
    if (message) testimonial.message = message;
    if (position) testimonial.position = position;
    if (location) testimonial.location = location;
    if (rating) testimonial.rating = parseFloat(rating);

    if (req.file) {
      // Delete old local file only â€” skip if Cloudinary
      await deleteLocalFile(testimonial.profileImage);
      testimonial.profileImage = getUploadedFileUrl(req.file, req);
    }

    const updated = await testimonial.save();
    const result = updated.toObject();
    result.profileImage = rewriteImageUrl(result.profileImage, req);
    return handleSuccess(res, 200, 'Testimonial updated successfully', result);
  } catch (error) {
    next(error);
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res, next) => {
  try {
    const deletedTestimonial = await TestimonialModel.findByIdAndDelete(req.params.id);
    if (!deletedTestimonial) return next(handleError(404, 'Testimonial not found'));

    // Only attempt local disk deletion â€” Cloudinary files are skipped automatically
    await deleteLocalFile(deletedTestimonial.profileImage);

    res.status(200).json({ message: 'Testimonial and image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
