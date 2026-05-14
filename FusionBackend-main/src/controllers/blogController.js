  import BlogModel from '../models/blogModel.js';
  import handleError from '../utils/errorHandler.js';
  import handleSuccess from '../utils/successHandler.js';
  import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
  import path from 'path'
  import fs from 'fs'
  import { __dirname, deleteFile } from '../utils/fileHelpers.js';
  import dotenv from 'dotenv'
  dotenv.config();
  import mongoose from 'mongoose';
  import { blogValidationSchema } from '../validations/validationSchemas.js';



  export const createBlog = async (req, res, next) => {
    try {
      const { title, subtitle, description, date, category, isFeatured } = req.body;

      if (!req.file) {
        return next(handleError(400, 'Image is required'));
      }

      // Construct full image URL
      const relativeUrl = getFileUrl(req.file.filename);
      const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

      // Step 1: Build blog data object
      const blogData = {
        title,
        subtitle,
        description,
        date,
        category,
        isFeatured,
        imageUrl: fullImageUrl, // âœ… correct key
      };

      // Step 2: Validate using Joi
      const { error } = blogValidationSchema.validate(blogData);
      if (error) {
        return next(handleError(400, error.details[0].message));
      }

      // Step 3: Save to DB
      const blog = new BlogModel(blogData);
      const savedBlog = await blog.save();

      return handleSuccess(res, 201, 'Blog created successfully', savedBlog);
    } catch (error) {
      next(error);
    }
  };


  // Get All Blogs
  export const getAllBlogs = async (req, res, next) => {
    try {
      const blogs = await BlogModel.find()
        .populate('category', 'name slug') // include only name and slug fields from BlogCategory
        .sort({ createdAt: -1 });

      return handleSuccess(res, 200, 'All blogs fetched successfully', blogs);
    } catch (error) {
      next(error);
    }
  };




  // Get Blog By Slug
  export const getBlogBySlug = async (req, res, next) => {
    try {
      const { slug } = req.params;
      const blog = await BlogModel.findOne({ slug });

      if (!blog) return next(handleError(404, 'Blog not found'));

      return handleSuccess(res, 200, 'Blog fetched successfully', blog);
    } catch (error) {
      next(error);
    }
  };

  // Update blog
export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updatedData = { ...req.body };

    // Remove MongoDB internal fields to prevent Joi validation errors
    if (updatedData._id) delete updatedData._id;
    if (updatedData.createdAt) delete updatedData.createdAt;
    if (updatedData.updatedAt) delete updatedData.updatedAt;
    if (updatedData.__v) delete updatedData.__v;

    // If category is an object (populated object), extract its _id
    if (
      updatedData.category &&
      typeof updatedData.category === 'object' &&
      updatedData.category._id
    ) {
      updatedData.category = updatedData.category._id;
    }

    // Validate category as a valid ObjectId or delete if invalid (optional)
    if (
      updatedData.category &&
      (typeof updatedData.category !== 'string' ||
       !mongoose.Types.ObjectId.isValid(updatedData.category))
    ) {
      delete updatedData.category;
    }

    // Handle image update if present
    if (req.file) {
      const relativeUrl = getFileUrl(req.file.filename);
      const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
      updatedData.imageUrl = fullImageUrl;
    }

    // Validate with Joi
    const { error } = blogValidationSchema.validate(updatedData);
    if (error) {
      return next(handleError(400, error.details[0].message));
    }

    // Update the blog document
    const updated = await BlogModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return next(handleError(404, 'Blog not found'));
    }

    return handleSuccess(res, 200, 'Blog updated successfully', updated);
  } catch (error) {
    next(error);
  }
};



// Delete blog
export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedBlog = await BlogModel.findByIdAndDelete(id);

    if (!deletedBlog) return next(handleError(404, 'Blog not found'));

    // Extract image filename (assuming it's like /uploads/filename.jpg)
    const imageUrl = deletedBlog.imageUrl;
    const imageName = imageUrl?.split('/uploads/')[1];

    if (imageName) {
      const imagePath = path.join(__dirname, '../../uploads', imageName);

      // Check and delete the image file
      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
        console.log('Blog image deleted:', imagePath);
      } else {
        console.log('Blog image not found:', imagePath);
      }
    }

    return handleSuccess(res, 200, 'Blog and image deleted successfully');
  } catch (error) {
    next(error);
  }
};



// Get Blogs by Category
export const getBlogsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const blogs = await BlogModel.find({ category }).sort({ createdAt: -1 });

    if (!blogs || blogs.length === 0) {
      return next(handleError(404, 'No blogs found for this category'));
    }

    return handleSuccess(res, 200, 'Blogs fetched by category successfully', blogs);
  } catch (error) {
    next(error);
  }
};


// Get Related Blogs by Category
export const getRelatedBlogs = async (req, res, next) => {
  const { category, excludeId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(excludeId)) {
    return res.status(400).json({ success: false, message: 'Invalid blog ID' });
  }

  try {
    const blogs = await BlogModel.find({
      category,
      _id: { $ne: new mongoose.Types.ObjectId(excludeId) },
    });
    return res.status(200).json({
      success: true,
      message: 'Related blogs fetched successfully',
      data: blogs,
    });
  } catch (error) {
    console.error('Error in getRelatedBlogs:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};





