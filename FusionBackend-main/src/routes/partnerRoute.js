import { Router } from 'express';
const partnerRoute = Router();
import {
  createPartner,
  getAllPartners,
  deletePartner,
  toggleVisibility,
} from '../controllers/partnerController.js';
import { arrayUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';



partnerRoute.post('/', arrayUpload('image', 5), authenticate, authorizeRoles('admin'),  createPartner);
partnerRoute.get('/', getAllPartners);
partnerRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deletePartner);
partnerRoute.patch('/toggle/:id', toggleVisibility);

export default partnerRoute;
