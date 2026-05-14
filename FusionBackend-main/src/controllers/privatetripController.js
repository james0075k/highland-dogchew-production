import PrivateTrip from '../models/privatetripModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { privateTripValidationSchema } from '../validations/validationSchemas.js';


export const createPrivateTrip = async (req, res, next) => {
  try {
    // Validate input using Joi
    const { error, value } = privateTripValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.map(err => err.message);
      return next(handleError(400, `Validation Error: ${validationErrors.join(', ')}`));
    }

    const newTrip = new PrivateTrip(value);
    const savedTrip = await newTrip.save();

    return handleSuccess(res, 201, savedTrip, 'Private trip inquiry submitted successfully');
  } catch (error) {
    next(error);
  }
};

// Get all private trip inquiries
export const getAllPrivateTrips = async (req, res, next) => {
  try {
    const trips = await PrivateTrip.find().sort({ createdAt: -1 });
    return handleSuccess(res, 200, trips, 'Private trip inquiries fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Get single private trip by ID
export const getPrivateTripById = async (req, res, next) => {
  try {
    const trip = await PrivateTrip.findById(req.params.id);
    if (!trip) return next(handleError(404, 'Private trip inquiry not found'));
    return handleSuccess(res, 200, trip, 'Private trip inquiry fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Update status
export const updatePrivateTripStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedTrip = await PrivateTrip.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedTrip) return next(handleError(404, 'Private trip inquiry not found'));
    return handleSuccess(res, 200, updatedTrip, 'Private trip status updated');
  } catch (error) {
    next(error);
  }
};

// Delete
export const deletePrivateTrip = async (req, res, next) => {
  try {
    const deleted = await PrivateTrip.findByIdAndDelete(req.params.id);
    if (!deleted) return next(handleError(404, 'Private trip inquiry not found'));
    return handleSuccess(res, 200, null, 'Private trip inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};
