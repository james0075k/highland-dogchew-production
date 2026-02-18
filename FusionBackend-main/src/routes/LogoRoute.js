import { Router } from "express";
const logoRoute = Router();

import { createLogo, getLogo } from '../controllers/logoController.js';
import { arrayUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';

logoRoute.post('/', arrayUpload('urls', 2), authenticate, authorizeRoles('admin'),  createLogo);
logoRoute.get('/', getLogo);

export default logoRoute;
