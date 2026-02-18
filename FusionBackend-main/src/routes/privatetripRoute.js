import { Router } from 'express';
const privateTripRoute = Router();
import { createPrivateTrip, getAllPrivateTrips, getPrivateTripById, updatePrivateTripStatus, deletePrivateTrip } from '../controllers/privatetripController.js';

import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

privateTripRoute.post('/', createPrivateTrip);
privateTripRoute.get('/', getAllPrivateTrips);
privateTripRoute.get('/:id', getPrivateTripById);
privateTripRoute.patch('/:id/status', authenticate, authorizeRoles('admin'),  updatePrivateTripStatus);
privateTripRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deletePrivateTrip);

export default privateTripRoute;
