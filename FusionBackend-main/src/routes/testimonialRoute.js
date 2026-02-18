import express from 'express';
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
    } from '../controllers/testimonialController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';

    const router = express.Router();

    router.post('/', singleUpload('profileImage'), authenticate, authorizeRoles('admin'),  createTestimonial);
    router.get('/', getAllTestimonials);
router.get('/:id', getTestimonialById);
router.put('/:id',  singleUpload('profileImage'), authenticate, authorizeRoles('admin'),  updateTestimonial);
router.delete('/:id', authenticate, authorizeRoles('admin'),  deleteTestimonial);

export default router;
