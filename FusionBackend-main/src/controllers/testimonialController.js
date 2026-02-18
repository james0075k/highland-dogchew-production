import TestimonialModel from '../models/testimonialModel.js';
import handleError from '../utils/errorHandler.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import handleSuccess from '../utils/sucessHandler.js';
import path from 'path'
import fs from 'fs'
// Create a new testimonial
export const createTestimonial = async (req, res, next) => {
  try {
    const { rating, message, name, location, position } = req.body;

    if (!req.file) {
      return next(handleError(400, 'Profile image is required'));
    }

    const relativeUrl = getFileUrl(req.file.filename); 
    const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    const newTestimonial = new TestimonialModel({
      rating,
      message,
      name,
      location,
      position,
      profileImage: fullImageUrl
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
    const testimonials = await TestimonialModel.find().sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    next(error);
  }
};

// Get a single testimonial by ID
export const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await TestimonialModel.findById(req.params.id);
    if (!testimonial) return next(handleError(404, 'Testimonial not found'));
    res.status(200).json(testimonial);
  } catch (error) {
    next(error);
  }
};

// Update a testimonial
export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, message, designation } = req.body;

    const testimonial = await TestimonialModel.findById(id);
    if (!testimonial) {
      return next(handleError(404, 'Testimonial not found'));
    }

    // Update text fields
    if (name) testimonial.name = name;
    if (message) testimonial.message = message;
    if (designation) testimonial.designation = designation;

    // Handle image replacement
    if (req.file) {
      const oldImageName = testimonial.profileImage?.split('/uploads/')[1];
      if (oldImageName) {
        const oldImagePath = path.join(__dirname, '../../uploads', oldImageName);
        if (fs.existsSync(oldImagePath)) {
          await deleteFile(oldImagePath);
        }
      }

      // Save new image URL
      testimonial.profileImage = `${req.protocol}://${req.get('host')}${getFileUrl(req.file.filename)}`;
    }

    const updated = await testimonial.save();
    return handleSuccess(res, 200, 'Testimonial updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res, next) => {
    try {
      const deletedTestimonial = await TestimonialModel.findByIdAndDelete(req.params.id);
      if (!deletedTestimonial) return next(handleError(404, 'Testimonial not found'));
  
      // Extract image filename (assuming it's like /uploads/filename.jpg)
      const profileImageUrl = deletedTestimonial.profileImage;
      const imageName = profileImageUrl.split('/uploads/')[1];
      const imagePath = path.join(__dirname, '../../uploads', imageName);
  
      // Check and delete the image file
      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
        console.log('Image deleted:', imagePath);
      } else {
        console.log('Image file not found:', imagePath);
      }
  
      res.status(200).json({ message: 'Testimonial and image deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
  
