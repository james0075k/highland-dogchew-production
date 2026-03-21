import CategoryModel from '../models/categoryModel.js';
import VarietyModel from '../models/varietyModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

// Create Category
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return next(handleError(400, 'Category name is required'));
    }

    const existing = await CategoryModel.findOne({ name: name.trim() });
    if (existing) {
      return next(handleError(409, 'Category with this name already exists'));
    }

    const category = await CategoryModel.create({ name: name.trim() });
    return handleSuccess(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

// Get All Categories
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
    return handleSuccess(res, 200, 'Categories fetched successfully', categories);
  } catch (error) {
    next(error);
  }
};

// Delete Category
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await CategoryModel.findById(id);
    if (!category) {
      return next(handleError(404, 'Category not found'));
    }

    // Check if any variety uses this category
    const varietyCount = await VarietyModel.countDocuments({ category: category.name });
    if (varietyCount > 0) {
      return next(handleError(400, `Cannot delete: ${varietyCount} variety(ies) are using this category`));
    }

    await CategoryModel.findByIdAndDelete(id);
    return handleSuccess(res, 200, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
