import FAQ from '../models/faqModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

// Create FAQ
export const createFAQ = async (req, res, next) => {
  try {
    const { title, question, answer } = req.body;

   

    const newFAQ = new FAQ({ title, question, answer });
    const savedFAQ = await newFAQ.save();

    handleSuccess(res, 201, 'FAQ created successfully', savedFAQ);
  } catch (error) {
    next(error);
  }
};



export const getAllFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  } 
};




// Get single FAQ
export const getFAQById = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return next(handleError(404, 'FAQ not found'));
    res.status(200).json(faq);
  } catch (error) {
    next(error);
  }
};

// Update FAQ
export const updateFAQ = async (req, res, next) => {
  try {
    const updatedFAQ = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedFAQ) return next(handleError(404, 'FAQ not found'));
    res.status(200).json(updatedFAQ);
  } catch (error) {
    next(error);
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res, next) => {
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
    if (!deletedFAQ) return next(handleError(404, 'FAQ not found'));
    res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    next(error);
  }
};



export const getFAQsByPage = async (req, res, next) => {
  try {
    const { pageName } = req.params;
    const faqs = await FAQ.find({ isPublished: true, page: pageName }).sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  }
};
