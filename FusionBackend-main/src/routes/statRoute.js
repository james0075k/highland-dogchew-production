import { Router } from 'express';

import { createStat, getAllStats, getStatById, updateStat, deleteStat, getDashboardStats  } from '../controllers/StatController.js';
const statRoute = Router();
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

statRoute.post('/', authenticate, authorizeRoles('admin'),  createStat);
statRoute.get('/', getAllStats);
statRoute.get('/dashboard',   getDashboardStats);
statRoute.get('/:id', getStatById);
statRoute.put('/:id', authenticate, authorizeRoles('admin'),  updateStat);
statRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteStat);

export default statRoute;