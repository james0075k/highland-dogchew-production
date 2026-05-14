import destinationModel from '../models/destinationModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';     // asdfasdf
import fs from 'fs';
import path from 'path';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import tourPackageModel from '../models/tourPackageModel.js';


// Create Destination
export const createDestination = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      description, 
      tag,
      isFeatured,
      slug,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return next(handleError(400, 'At least one image is required'));
    }

    const imageUrls = req.files.map(file => {
      const relativeUrl = getFileUrl(file.filename);
      return `${req.protocol}://${req.get('host')}${relativeUrl}`;
    });

    const destination = new destinationModel({
      title,
      subtitle,
      description,
      tag,
      isFeatured,
      slug,
      imageUrls, // use array of URLs
    });

    const saved = await destination.save();
    return handleSuccess(res, 201, 'Destination created successfully', saved);
  } catch (error) {
    next(error);
  }
};


// Get All Destinations
// Get All Destinations
export const getAllDestinations = async (req, res, next) => {
  try {
    const destinations = await destinationModel.find().sort({ createdAt: -1 });

    const enrichedDestinations = await Promise.all(
      destinations.map(async (destination) => {
        const count = await tourPackageModel.countDocuments({
          destination: destination._id,
        });

        return {
          ...destination.toObject(),
          totalTrips: count, // Renamed to totalTrips
        };
      })
    );

    return handleSuccess(res, 200, 'Destinations fetched successfully', enrichedDestinations);
  } catch (error) {
    next(error);
  }
};



// Get Destination by Slug
export const getDestinationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Step 1: Find destination by slug
    const destination = await destinationModel.findOne({ slug });

    if (!destination) {
      return next(handleError(404, 'Destination not found'));
    }

    // Step 2: Find tour packages related to this destination
    const relatedPackages = await tourPackageModel.find({ destination: destination._id }).select('_id');

    // .populate('destination');


    // Step 3: Return both destination and related packages
    return handleSuccess(res, 200, 'Destination and related packages fetched', {
      destination,
      relatedPackages,
    });
  } catch (error) {
    next(error);
  }
};

// Update Destination
export const updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await destinationModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) return next(handleError(404, 'Destination not found'));

    return handleSuccess(res, 200, 'Destination updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// Delete Destination (with image)
export const deleteDestination = async (req, res, next) => {
  try {
    const deleted = await destinationModel.findByIdAndDelete(req.params.id);
    if (!deleted) return next(handleError(404, 'Destination not found'));

    const imageUrls = deleted.imageUrls;

    if (Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        const imageName = url.split('/uploads/')[1];
        const imagePath = path.join(__dirname, '../../uploads', imageName);

        if (fs.existsSync(imagePath)) {
          await deleteFile(imagePath);
          console.log('Image deleted:', imagePath);
        } else {
          console.log('Image file not found:', imagePath);
        }
      }
    }

    return handleSuccess(res, 200, 'Destination and image(s) deleted successfully');
  } catch (error) {
    next(error);
  }
};






export const searchDestinations = async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, startDate, endDate } = req.query;

    const filter = {};

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.priceMin = { $gte: Number(minPrice || 0) };
      filter.priceMax = { $lte: Number(maxPrice || Infinity) };
    }

    // Add support for filtering by date if availableFrom and availableTo exist
    if (startDate && endDate) {
      filter.availableFrom = { $lte: new Date(startDate) };
      filter.availableTo = { $gte: new Date(endDate) };
    }

    const destinations = await destinationModel.find(filter).sort({ createdAt: -1 });

    return handleSuccess(res, 200, 'Search results found', destinations);
  } catch (error) {
    next(error);
  }
};


