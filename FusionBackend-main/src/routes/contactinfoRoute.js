import { Router } from 'express';
import { saveContactInfo, getContactInfo, deleteContactInfo } from '../controllers/contactinfoController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const contactinfoRoute = Router();

contactinfoRoute.post('/',  authenticate, authorizeRoles('admin'), saveContactInfo);   // Create or Update
contactinfoRoute.get('/', getContactInfo);         // Get
contactinfoRoute.delete('/', authenticate, authorizeRoles('admin'), deleteContactInfo);   // Delete

export default contactinfoRoute;
