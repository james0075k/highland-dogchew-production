import BookingModel from '../models/bookingModel.js';
import TourPackage from '../models/tourPackageModel.js'; 
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { bookingValidationSchema } from '../validations/validationSchemas.js';









// Helper function to calculate total amount
function calculateTotalAmount(totalPeople, basePrice) {
  // Assuming totalPeople is a number or object with adults/children
  let peopleCount = 1;
  
  if (typeof totalPeople === 'number') {
    peopleCount = totalPeople;
  } else if (typeof totalPeople === 'object' && totalPeople.adults) {
    peopleCount = totalPeople.adults + (totalPeople.children || 0);
  } else if (typeof totalPeople === 'string') {
    // Handle string values like "2-4" or "5+"
    if (totalPeople.includes('-')) {
      peopleCount = parseInt(totalPeople.split('-')[0]);
    } else if (totalPeople.includes('+')) {
      peopleCount = parseInt(totalPeople.replace('+', ''));
    } else {
      peopleCount = parseInt(totalPeople) || 1;
    }
  }
  
  return basePrice * peopleCount;
}

export const createBooking = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = bookingValidationSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const validationErrors = error.details.map(err => err.message);
      return next(handleError(400, `Validation Error: ${validationErrors.join(', ')}`));
    }

    const {
      name,
      email,
      phone,
      country,
      travelDate,
      totalPeople,
      specialRequests,
      tourPackageId,
    } = value;

    // Check for existing booking
    const existingBooking = await BookingModel.findOne({
      'guestInfo.phone': phone,
      tourPackage: tourPackageId,
      travelDate: new Date(travelDate),
    });

    if (existingBooking) {
      return next(handleError(400, 'You have already booked this package on the same date.'));
    }

    // Fetch tour package to get base price
    const tourPackage = await TourPackage.findById(tourPackageId);
    if (!tourPackage) {
      return next(handleError(404, 'Tour package not found'));
    }

    // Validate tour package price
    if (typeof tourPackage.basePrice !== 'number' || isNaN(tourPackage.basePrice)) {
      return next(handleError(400, 'Invalid tour package price'));
    }

    // Calculate total amount
    const totalAmount = tourPackage.basePrice * totalPeople;

    const booking = new BookingModel({
      guestInfo: { name, email, phone, country },
      travelDate: new Date(travelDate),
      bookingDate: new Date(),
      totalPeople,
      specialRequests,
      tourPackage: tourPackageId,
      totalAmount,
      paymentStatus: 'pending',
      status: 'pending'
    });

    const savedBooking = await booking.save();
    return handleSuccess(res, 201, 'Booking created successfully', savedBooking);
  } catch (err) {
    console.error("CreateBooking Error:", err.message);
    return next(handleError(500, `Failed to create booking: ${err.message}`));
  }
};

// GET All Bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.find().populate('tourPackage');
    return handleSuccess(res, 200, 'Bookings fetched successfully', bookings);
  } catch (err) {
    return next(handleError(500, `Failed to fetch bookings: ${err.message}`));
  }
};

// GET Booking By ID
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id).populate('tourPackage');
    if (!booking) {
      return next(handleError(404, 'Booking not found'));
    }
    return handleSuccess(res, 200, 'Booking fetched successfully', booking);
  } catch (err) {
    return next(handleError(500, `Failed to fetch booking: ${err.message}`));
  }
};

// UPDATE Booking
export const updateBooking = async (req, res, next) => {
  try {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('tourPackage');
    
    if (!updatedBooking) {
      return next(handleError(404, 'Booking not found'));
    }
    return handleSuccess(res, 200, 'Booking updated successfully', updatedBooking);
  } catch (err) {
    return next(handleError(500, `Failed to update booking: ${err.message}`));
  }
};

// DELETE Booking
export const deleteBooking = async (req, res, next) => {
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return next(handleError(404, 'Booking not found'));
    }
    return handleSuccess(res, 200, 'Booking deleted successfully');
  } catch (err) {
    return next(handleError(500, `Failed to delete booking: ${err.message}`));
  }
};