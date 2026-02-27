import InstagramPostModel from '../models/instagramPostModel.js';
import handleError from '../utils/errorHandler.js';
import { deleteFile, __dirname } from '../utils/fileHelpers.js';
import { getFileUrl } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import handleSuccess from '../utils/sucessHandler.js';
import path from 'path';
import fs from 'fs';

// Create a new Instagram post
export const createInstagramPost = async (req, res, next) => {
  try {
    const { caption, instagramLink, type, order, isActive } = req.body;

    if (!req.file) {
      return next(handleError(400, 'Post image is required'));
    }

    const relativeUrl = getFileUrl(req.file.filename);
    const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    const newPost = new InstagramPostModel({
      image: fullImageUrl,
      caption,
      instagramLink,
      type: type || 'photo',
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    });

    const saved = await newPost.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

// Get all active posts (public — sorted by order, then newest first)
export const getAllInstagramPosts = async (req, res, next) => {
  try {
    const posts = await InstagramPostModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

// Get ALL posts (admin — includes inactive)
export const getAllInstagramPostsAdmin = async (req, res, next) => {
  try {
    const posts = await InstagramPostModel.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

// Get a single post by ID
export const getInstagramPostById = async (req, res, next) => {
  try {
    const post = await InstagramPostModel.findById(req.params.id);
    if (!post) return next(handleError(404, 'Instagram post not found'));
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// Update a post
export const updateInstagramPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { caption, instagramLink, type, order, isActive } = req.body;

    const post = await InstagramPostModel.findById(id);
    if (!post) return next(handleError(404, 'Instagram post not found'));

    if (caption !== undefined) post.caption = caption;
    if (instagramLink !== undefined) post.instagramLink = instagramLink;
    if (type !== undefined) post.type = type;
    if (order !== undefined) post.order = parseInt(order);
    if (isActive !== undefined) post.isActive = isActive === 'true' || isActive === true;

    // Handle image replacement
    if (req.file) {
      const oldImageName = post.image?.split('/uploads/')[1];
      if (oldImageName) {
        const oldImagePath = path.join(__dirname, '../../uploads', oldImageName);
        if (fs.existsSync(oldImagePath)) {
          await deleteFile(oldImagePath);
        }
      }
      post.image = `${req.protocol}://${req.get('host')}${getFileUrl(req.file.filename)}`;
    }

    const updated = await post.save();
    return handleSuccess(res, 200, 'Instagram post updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// Delete a post
export const deleteInstagramPost = async (req, res, next) => {
  try {
    const deleted = await InstagramPostModel.findByIdAndDelete(req.params.id);
    if (!deleted) return next(handleError(404, 'Instagram post not found'));

    const imageName = deleted.image?.split('/uploads/')[1];
    if (imageName) {
      const imagePath = path.join(__dirname, '../../uploads', imageName);
      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
      }
    }

    res.status(200).json({ success: true, message: 'Instagram post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
