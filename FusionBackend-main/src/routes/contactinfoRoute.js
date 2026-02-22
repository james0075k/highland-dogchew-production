import { Router } from 'express';
import { saveContactInfo, getContactInfo, deleteContactInfo } from '../controllers/contactinfoController.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

const contactinfoRoute = Router();

contactinfoRoute.post('/',  authenticate, authorizeRoles('admin', 'superadmin'), saveContactInfo);   // Create or Update
contactinfoRoute.get('/', getContactInfo);         // Get
contactinfoRoute.delete('/', authenticate, authorizeRoles('admin', 'superadmin'), deleteContactInfo);   // Delete

export default contactinfoRoute;
