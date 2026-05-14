import { Router } from 'express';
const destinationRoute = Router();

import {
  createDestination,
  getAllDestinations,
  getDestinationBySlug,
  updateDestination,
  deleteDestination,
  searchDestinations
} from '../controllers/destinationController.js';
import { arrayUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

destinationRoute.post('/', arrayUpload('imageUrls', 5), authenticate, authorizeRoles('admin'), createDestination);
destinationRoute.get('/', getAllDestinations);
destinationRoute.get('/:slug', getDestinationBySlug);
destinationRoute.put('/:id', authenticate, authorizeRoles('admin'), updateDestination);
destinationRoute.delete('/:id', authenticate, authorizeRoles('admin'), deleteDestination);
destinationRoute.get('/search', searchDestinations);

export default destinationRoute;
