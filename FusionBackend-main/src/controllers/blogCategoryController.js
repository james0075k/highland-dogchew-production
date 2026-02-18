import BlogCategory from '../models/blogCategoryModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

// Create category
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = new BlogCategory({ name });
    const saved = await category.save();
    return handleSuccess(res, 201, 'Category created successfully', saved);
  } catch (err) {
    next(err);
  }
};

// Get all categories
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await BlogCategory.find().sort({ name: 1 });
    return handleSuccess(res, 200, 'Categories fetched', categories);
  } catch (err) {
    next(err);
  }
};



export const deleteBlogCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCategory = await BlogCategory.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return next(handleError(404, "Blog Category not found"));
    }

    return handleSuccess(res, 200, "Blog Category deleted successfully", deletedCategory);
  } catch (error) {
    return next(error); // Correct way to handle errors
  }
};
