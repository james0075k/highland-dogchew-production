import TermsModel from '../models/termsModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';

// âœ… Create Terms (Only one allowed)
export const createTerms = async (req, res, next) => {
  try {
    const existing = await TermsModel.findOne();
    if (existing) {
      return next(handleError(400, 'Terms & Conditions already exist.'));
    }

    const { pageTitle, sections } = req.body;
    const newTerms = new TermsModel({ pageTitle, sections });
    const saved = await newTerms.save();
    return handleSuccess(res, 201, 'Terms & Conditions created successfully', saved);
  } catch (error) {
    next(error);
  }
};

// âœ… Update Terms by ID
export const updateTerms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pageTitle, sections } = req.body;

    const existing = await TermsModel.findById(id);
    if (!existing) {
      return next(handleError(404, 'Terms & Conditions not found.'));
    }

    existing.pageTitle = pageTitle || existing.pageTitle;
    existing.sections = sections || existing.sections;
    existing.lastUpdated = new Date();

    const updated = await existing.save();
    return handleSuccess(res, 200, 'Terms & Conditions updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// âœ… Get All Terms
export const getAllTerms = async (req, res, next) => {
  try {
    const terms = await TermsModel.find();
    return handleSuccess(res, 200, 'All Terms & Conditions fetched successfully', terms);
  } catch (error) {
    next(error);
  }
};

// âœ… Delete Terms by ID
export const deleteTerms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await TermsModel.findByIdAndDelete(id);

    if (!result) {
      return next(handleError(404, 'Terms & Conditions not found.'));
    }

    return handleSuccess(res, 200, 'Terms & Conditions deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
