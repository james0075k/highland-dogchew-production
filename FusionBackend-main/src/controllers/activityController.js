
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import path from 'path';
import fs from 'fs';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import mongoose from 'mongoose';
import tourCategoryModel from '../models/tourCategoryModel.js';
import { activityValidationSchema } from '../validations/validationSchemas.js';
import tourPackageModel from '../models/tourPackageModel.js';
import activityModel from '../models/activityModel.js';


export const createActivity = async (req, res, next) => {
  try {
    // Check for required image
    if (!req.file) {
      return next(handleError(400, 'Image is required'));
    }

    // Construct full image URL
    const relativeUrl = getFileUrl(req.file.filename);
    const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    // Build complete data object
    const activityData = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      isFeatured: req.body.isFeatured,
      category: req.body.category,
      image: fullImageUrl,
    };

    // Validate with Joi
    const { error } = activityValidationSchema.validate(activityData);
    if (error) {
      return next(handleError(400, error.details[0].message));
    }

    // Save to DB
    const newActivity = new activityModel(activityData);
    const saved = await newActivity.save();

    return handleSuccess(res, 201, 'Activity created successfully', saved);
  } catch (error) {
    next(error);
  }
};

export const getAllActivities = async (req, res, next) => {
  try {
    const activities = await activityModel.find().populate('category');

    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
       const count = await tourPackageModel.countDocuments({
  activity: activity._id,
});


        return {
          ...activity.toObject(),
          totalTrips: count,
        };
      })
    );

    return handleSuccess(res, 200, 'Activities fetched successfully', enrichedActivities);
  } catch (error) {
    next(error);
  }
};


export const getActivityBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Step 1: Find activity by slug
    const activity = await activityModel.findOne({ slug }).populate('category');

    if (!activity) {
      return next(handleError(404, 'Activity not found'));
    }

    // Step 2: Find related tour packages that include this activity
   const relatedPackages = await tourPackageModel.find({
  activity: activity._id,
}).select('_id');

    // Step 3: Return both activity and related packages
    return handleSuccess(res, 200, 'Activity and related packages fetched', {
      activity,
      relatedPackages,
    });
  } catch (error) {
    next(error);
  }
};



// Get featured activity
export const getFeaturedActivity = async (req, res, next) => {
  try {
    const featured = await actiivityModel.findOne({ isFeatured: true }).populate('category');
    return handleSuccess(res, 200, 'Featured activity fetched successfully', featured);
  } catch (error) {
    next(error);
  }
};


// Delete activity
export const deleteActivity = async (req, res, next) => {
    try {
      const activity = await activityModel.findByIdAndDelete(req.params.id);
      if (!activity) return next(handleError(404, 'Activity not found'));
  
      const imageUrl = activity.image; // assuming this is a single string
      const imageName = imageUrl?.split('/uploads/')[1]; // extract filename
      
      if (imageName) {
        const imagePath = path.join(__dirname, '../../uploads', imageName);
  
        if (fs.existsSync(imagePath)) {
          await deleteFile(imagePath);
          console.log('Activity image deleted:', imagePath);
        } else {
          console.log('Image file not found:', imagePath);
        }
      }
  
      return handleSuccess(res, 200, 'Activity and image deleted successfully', activity);
    } catch (error) {
      next(error);
    }
  };




  export const getActivitiesByCategoryFlexible = async (req, res, next) => {
    try {
      const { value } = req.params;
  
      let category;
      if (mongoose.Types.ObjectId.isValid(value)) {
        // Check if it's a valid ObjectId
        category = await tourCategoryModel.findById(value);
      } else {
        // Otherwise, treat it as a slug
        category = await tourCategoryModel.findOne({ slug: value });
      }
  
      if (!category) {
        return next(handleError(404, 'Category not found'));
      }
  
      const activities = await activityModel
        .find({ category: category._id })
        .populate('category');
  
      return handleSuccess(res, 200, 'Activities fetched successfully', activities);
    } catch (error) {
      next(error);
    }
  };



export const updateActivity = async (req, res, next) => {
  try {
    const activityId = req.params.id;
    const existingActivity = await activityModel.findById(activityId);

    if (!existingActivity) {
      return next(handleError(404, 'Activity not found'));
    }

    let updatedImageUrl = existingActivity.image;

    // Handle new image if uploaded
    if (req.file) {
      // Delete old image
      const oldImage = existingActivity.image?.split('/uploads/')[1];
      if (oldImage) {
        const oldImagePath = path.join(__dirname, '../../uploads', oldImage);
        if (fs.existsSync(oldImagePath)) {
          await deleteFile(oldImagePath);
        }
      }

      // Set new image URL
      const relativeUrl = getFileUrl(req.file.filename);
      updatedImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
    }

    // Normalize category if it's an object with _id
    if (req.body.category && typeof req.body.category === 'object' && req.body.category._id) {
      req.body.category = req.body.category._id;
    }

    // Delete category if invalid string or not a valid ObjectId
    if (
      req.body.category &&
      (typeof req.body.category !== 'string' || !mongoose.Types.ObjectId.isValid(req.body.category))
    ) {
      delete req.body.category;
    }

    // Prepare category value for updateData
    let categoryValue = req.body.category;

    if (!categoryValue) {
      // If existingActivity.category is populated object, extract _id string
      if (existingActivity.category && typeof existingActivity.category === 'object' && existingActivity.category._id) {
        categoryValue = existingActivity.category._id.toString();
      } else if (existingActivity.category) {
        // else convert to string
        categoryValue = existingActivity.category.toString();
      } else {
        categoryValue = null;
      }
    }

    const updatedData = {
      title: req.body.title || existingActivity.title,
      subtitle: req.body.subtitle || existingActivity.subtitle,
      description: req.body.description || existingActivity.description,
      isFeatured: req.body.isFeatured ?? existingActivity.isFeatured,
      category: categoryValue,
      image: updatedImageUrl,
    };

    // Validate
    const { error } = activityValidationSchema.validate(updatedData);
    if (error) return next(handleError(400, error.details[0].message));

    // Update and save
    const updatedActivity = await activityModel.findByIdAndUpdate(activityId, updatedData, {
      new: true,
      runValidators: true,
    });

    return handleSuccess(res, 200, 'Activity updated successfully', updatedActivity);
  } catch (error) {
    next(error);
  }
};
