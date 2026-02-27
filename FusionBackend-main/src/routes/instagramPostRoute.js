import express from 'express';
import {
  createInstagramPost,
  getAllInstagramPosts,
  getAllInstagramPostsAdmin,
  getInstagramPostById,
  updateInstagramPost,
  deleteInstagramPost,
} from '../controllers/instagramPostController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';

const router = express.Router();

// Public — active posts only
router.get('/', getAllInstagramPosts);

// Admin — all posts including inactive
router.get('/admin/all', authenticate, authorizeRoles('admin'), getAllInstagramPostsAdmin);

router.get('/:id', getInstagramPostById);
router.post('/', singleUpload('image'), authenticate, authorizeRoles('admin'), createInstagramPost);
router.put('/:id', singleUpload('image'), authenticate, authorizeRoles('admin'), updateInstagramPost);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteInstagramPost);

export default router;
