import StatModel from '../models/StatModel.js';
import BlogModel from '../models/blogModel.js';
import tourPackageModel from '../models/tourPackageModel.js';
import destinationModel from '../models/destinationModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js'
import TestimonialModel from '../models/testimonialModel.js';
import BookingModel from '../models/bookingModel.js';
import partnerModel from '../models/partnerModel.js';
import ContactUs from '../models/contactModel.js';
import activityModel from '../models/activityModel.js';




// Create Stat
export const createStat = async (req, res, next) => {
  try {
    const { value, label, description } = req.body;
    const newStat = new StatModel({ value, label, description });
    const savedStat = await newStat.save();
    return handleSuccess(res, 201, savedStat, 'Stat created successfully');
  } catch (error) {
    next(error);
  }
};

// Get all Stats
export const getAllStats = async (req, res, next) => {
  try {
    const stats = await StatModel.find().sort({ createdAt: 1 });
    return handleSuccess(res, 200, stats, 'Stats fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get single Stat by ID
export const getStatById = async (req, res, next) => {
  try {
    const stat = await StatModel.findById(req.params.id);
    if (!stat) return next(handleError(404, 'Stat not found'));
    return handleSuccess(res, 200, stat, 'Stat fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Update Stat
export const updateStat = async (req, res, next) => {
  try {
    const updatedStat = await StatModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedStat) return next(handleError(404, 'Stat not found'));
    return handleSuccess(res, 200, updatedStat, 'Stat updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete Stat
export const deleteStat = async (req, res, next) => {
  try {
    const deletedStat = await StatModel.findByIdAndDelete(req.params.id);
    if (!deletedStat) return next(handleError(404, 'Stat not found'));
    return handleSuccess(res, 200, null, 'Stat deleted successfully');
  } catch (error) {
    next(error);
  }
};








export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBlogs,
      totalDestination,
      totalTestimonial,
      totalPackages,
      totalBookings,
      totalPartners,
      recentBookings,
      recentContacts,
      recentPackages,
      recentActivities,
      recentDestinations
    ] = await Promise.all([
      BlogModel.countDocuments(),
      destinationModel.countDocuments(),
      TestimonialModel.countDocuments(),
      tourPackageModel.countDocuments(),
      BookingModel.countDocuments(),
      partnerModel.countDocuments(),
      BookingModel.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({ path: 'tourPackage', select: 'title' }),
    ContactUs.find().sort({ createdAt: -1 }).limit(3).select('message guestInfo'),

      tourPackageModel.find().sort({ createdAt: -1 }).limit(3).select('title'),
      activityModel.find().sort({ createdAt: -1 }).limit(3).select('title'),
      destinationModel.find().sort({ createdAt: -1 }).limit(3).select('title'),
    ]);

    const stats = {
      totalBlogs,
      totalDestination,
      totalTestimonial,
      totalPackages,
      totalBookings,
      totalPartners,
      recent: {
        bookings: recentBookings.map(item => item.guestInfo?.phone || 'No package assigned'),

      contacts: recentContacts.map(item => item.guestInfo?.name || 'No contact message'),

        packages: recentPackages.map(item => item.title),
        activities: recentActivities.map(item => item.title),
        destinations: recentDestinations.map(item => item.title)
      }
    };


    return handleSuccess(res, 200, stats, 'Dashboard stats fetched successfully');
  } catch (error) {
    next(handleError(500, 'Failed to fetch dashboard stats'));
  }
};