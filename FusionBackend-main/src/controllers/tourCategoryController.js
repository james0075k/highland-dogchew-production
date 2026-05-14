import tourCategoryModel from '../models/tourCategoryModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import path from 'path';
import fs from 'fs';


  export const createTourCategory = async (req, res, next) => {
    try {
      const { name } = req.body;

      if (!name) return next(handleError(400, 'Category name is required'));

      if (!req.file) return next(handleError(400, 'Category image is required'));

      // Check for duplicates
      const existing = await tourCategoryModel.findOne({ name });
      if (existing) return next(handleError(409, 'Category already exists'));

      // Build full image URL
      const relativeUrl = getFileUrl(req.file.filename); // You need to import getFileUrl
      const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

      const category = new tourCategoryModel({
        name,
        image: fullImageUrl,
      });

    const saved = await category.save();

    return handleSuccess(res, 201, 'Tour category created successfully', saved);
  } catch (error) {
    next(error);
  }
};


// Get all tour categories
export const getAllTourCategories = async (req, res, next) => {
  try {
    const categories = await tourCategoryModel.find();
    return handleSuccess(res, 200, 'Categories fetched successfully', categories);
  } catch (error) {
    next(error);
  }
};


export const deleteTourCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCategory = await tourCategoryModel.findByIdAndDelete(id);

    if (!deletedCategory) {
      return next(handleError(404, "Tour Category not found"));
    }

    // Delete image file if exists
    const imageUrl = deletedCategory.image;
    if (imageUrl) {
      const imageName = imageUrl.split('/uploads/')[1];
      if (imageName) {
        const imagePath = path.join(__dirname, '../../uploads', imageName);
        if (fs.existsSync(imagePath)) {
          await deleteFile(imagePath);
          console.log('Category image deleted:', imagePath);
        } else {
          console.log('Category image file not found:', imagePath);
        }
      }
    }

    return handleSuccess(res, 200, "Tour Category deleted successfully", deletedCategory);
  } catch (error) {
    return next(error);
  }
};

export const getTourCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await tourCategoryModel.findOne({ slug });

    if (!category) {
      return next(handleError(404, 'Tour category not found'));
    }

    return handleSuccess(res, 200, 'Category fetched successfully', category);
  } catch (error) {
    next(error);
  }
};
