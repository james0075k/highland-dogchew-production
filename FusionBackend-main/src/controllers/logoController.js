import LogoModel from '../models/logoModel.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const createLogo = async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      throw handleError(400, 'At least 2 images are required');
    }

    const existingLogo = await LogoModel.findOne();

    if (existingLogo) {
      const oldUrls = existingLogo.image.urls;
      for (const oldUrl of oldUrls) {
        const oldFilename = oldUrl.split('/uploads/')[1];
        const oldFilePath = path.join(__dirname, '../../uploads', oldFilename);
        if (fs.existsSync(oldFilePath)) {
          await deleteFile(oldFilePath).catch(console.error);
        }
      }

      await LogoModel.findByIdAndDelete(existingLogo._id);
    }

    const uploadedUrls = req.files.map((file) => getFileUrl(file.filename));

    const logo = new LogoModel({
      image: {
        urls: uploadedUrls,
        height: Number(req.body.height) || 0,
        width: Number(req.body.width) || 0,
        alt: req.body.alt || 'Logo image',
      },
    });

    const savedLogo = await logo.save();

    const fullImageUrls = uploadedUrls.map((url) => `${req.protocol}://${req.get('host')}${url}`);

    const responseData = {
      ...savedLogo._doc,
      image: {
        ...savedLogo.image,
        urls: fullImageUrls,
      },
    };

    return handleSuccess(res, 201, 'Logo created successfully', responseData);
  } catch (error) {
    next(error);
  }
};

export const getLogo = async (req, res, next) => {
  try {
    const logo = await LogoModel.findOne();
    if (!logo) {
      throw handleError(404, 'Logo not found');
    }

    const fullImageUrls = logo.image.urls.map((url) => `${req.protocol}://${req.get('host')}${url}`);

    const modifiedLogo = {
      ...logo._doc,
      image: {
        ...logo.image,
        urls: fullImageUrls,
      },
    };

    return handleSuccess(res, 200, 'Logo retrieved successfully', modifiedLogo);
  } catch (error) {
    next(error);
  }
};
