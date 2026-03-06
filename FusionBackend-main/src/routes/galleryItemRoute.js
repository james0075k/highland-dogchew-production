import { Router } from 'express';
import {
  getGalleryItems,
  getGalleryItemsAdmin,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryItemController.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const galleryItemRoute = Router();

// Public
galleryItemRoute.get('/', getGalleryItems);

// Admin only
galleryItemRoute.get('/admin/all', authenticate, authorizeRoles('admin'), getGalleryItemsAdmin);
galleryItemRoute.post('/',    authenticate, authorizeRoles('admin'), singleUpload('image'), createGalleryItem);
galleryItemRoute.put('/:id',  authenticate, authorizeRoles('admin'), singleUpload('image'), updateGalleryItem);
galleryItemRoute.delete('/:id', authenticate, authorizeRoles('admin'), deleteGalleryItem);

export default galleryItemRoute;
