import { Router } from 'express';
const heroBannerRoute = Router();
import { 
    createHeroBanner, 
    readBannerByPage, 
    updateHeroBanner, 
    deleteHeroBanner 
} from '../controllers/heroBannerController.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js';



heroBannerRoute.post("/", singleUpload('bannerImage'), authenticate, authorizeRoles('admin'),  createHeroBanner);
heroBannerRoute.get("/:page", readBannerByPage);
heroBannerRoute.put("/:page", singleUpload("bannerImage"), updateHeroBanner);
heroBannerRoute.delete("/:id", authenticate, authorizeRoles('admin'),  deleteHeroBanner);

export default heroBannerRoute;
