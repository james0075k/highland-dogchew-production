import { Router } from 'express';
import {
  createTeamMember,
  getAllTeamMembers,
  deleteTeamMember,
  updateTeamMember,
  getTeamMemberById,
} from '../controllers/teamController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

import { fieldsUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';

const teamRoute = Router();

const multiUpload = fieldsUpload([
  { name: 'image', maxCount: 1 },                 // main image
  { name: 'imageUrls', maxCount: 10 }, // certification images
]);

teamRoute.post('/', multiUpload, authenticate, authorizeRoles('admin'),  createTeamMember);
teamRoute.put('/:id', multiUpload, authenticate, authorizeRoles('admin'),  updateTeamMember);

teamRoute.get('/', getAllTeamMembers);
teamRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteTeamMember);
teamRoute.get('/:id', getTeamMemberById);

export default teamRoute;
