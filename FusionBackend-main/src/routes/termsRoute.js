import { Router } from 'express';
import {
  createTerms,
  getAllTerms,
  updateTerms,
  deleteTerms,
} from '../controllers/termsController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const termsRoute = Router();

termsRoute.get('/', getAllTerms);             // GET all terms
termsRoute.post('/', authenticate, authorizeRoles('admin'),  createTerms);            // Create a term
termsRoute.put('/:id', authenticate, authorizeRoles('admin'),  updateTerms);          // Update by ID
termsRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteTerms);       // Delete by ID

export default termsRoute;
