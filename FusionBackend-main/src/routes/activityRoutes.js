import { Router } from 'express';

import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import {
  createActivity,
  getAllActivities,
  getFeaturedActivity,
  deleteActivity,
  getActivitiesByCategoryFlexible,
  getActivityBySlug,
  updateActivity


} from '../controllers/activityController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const activityRoute = Router();

activityRoute.post('/', singleUpload('image'), authenticate, authorizeRoles('admin'),  createActivity);
activityRoute.get('/', getAllActivities);
activityRoute.get('/:slug',getActivityBySlug);
activityRoute.get('/featured', getFeaturedActivity);
activityRoute.get('/category/:value', getActivitiesByCategoryFlexible);
activityRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteActivity);
activityRoute.put('/:id', singleUpload('image'), authenticate, authorizeRoles('admin'),  updateActivity);

export default activityRoute;


