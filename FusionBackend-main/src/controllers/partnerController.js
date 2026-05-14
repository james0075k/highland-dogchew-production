import PartnerModel from '../models/partnerModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import path from 'path';
import fs from 'fs';

// Create a new partner
export const createPartner = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!req.files || req.files.length < 2) {
      return next(handleError(400, 'At least two images are required'));
    }

    // Map images by index: [0] = small, [1] = big
    const smallImageUrl = `${req.protocol}://${req.get('host')}${getFileUrl(req.files[0].filename)}`;
    const bigImageUrl = `${req.protocol}://${req.get('host')}${getFileUrl(req.files[1].filename)}`;

    const newPartner = new PartnerModel({
      title,
      images: {
        small: smallImageUrl,
        big: bigImageUrl,
      },
    });

    const savedPartner = await newPartner.save();
    return handleSuccess(res, 201, 'Partner created successfully', savedPartner);
  } catch (error) {
    next(error);
  }
};

// Get all visible partners
export const getAllPartners = async (req, res, next) => {
  try {
    const partners = await PartnerModel.find({ isVisible: true }).sort({ createdAt: 1 });
    return handleSuccess(res, 200, 'Partners fetched successfully', partners);
  } catch (error) {
    next(error);
  }
};

export const deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partner = await PartnerModel.findByIdAndDelete(id);

    if (!partner) return next(handleError(404, 'Partner not found'));

    // Access both image URLs
    const { small, big } = partner.images || {};

    // Delete both image files from uploads
    const deleteImageFile = async (url) => {
      const imageName = url?.split('/uploads/')[1];
      if (imageName) {
        const imagePath = path.join(__dirname, '../../uploads', imageName);
        if (fs.existsSync(imagePath)) {
          await deleteFile(imagePath);
          console.log('Deleted:', imagePath);
        } else {
          console.log('Image not found:', imagePath);
        }
      }
    };

    await deleteImageFile(small);
    await deleteImageFile(big);

    return handleSuccess(res, 200, 'Partner and images deleted successfully', partner);
  } catch (error) {
    next(error);
  }
};


// Toggle partner visibility
export const toggleVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partner = await PartnerModel.findById(id);
    if (!partner) return next(handleError(404, 'Partner not found'));

    partner.isVisible = !partner.isVisible;
    const updated = await partner.save();

    return handleSuccess(res, 200, 'Partner visibility updated', updated);
  } catch (error) {
    next(error);
  }
};
