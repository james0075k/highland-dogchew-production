
import { Router } from 'express';
const faqRoute= Router();

import {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  getFAQsByPage
} from '../controllers/faqController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';




faqRoute.post('/',  authenticate, authorizeRoles('admin'), createFAQ);
faqRoute.get('/',  getAllFAQs);
faqRoute.get('/:id', getFAQById);
faqRoute.put('/:id', authenticate, authorizeRoles('admin'), updateFAQ);
faqRoute.delete('/:id', authenticate, authorizeRoles('admin'), deleteFAQ);
faqRoute.get('/page/:pageName', getFAQsByPage);


export default faqRoute;
