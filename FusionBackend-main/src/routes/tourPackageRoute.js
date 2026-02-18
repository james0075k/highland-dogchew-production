
import { Router } from 'express';
import {
  createTourPackage,
  getAllTourPackages,
  updateTourPackage,
  deleteTourPackage,
  searchTourPackages,
  filterByDuration,
  getRelatedPackages, 
  getTourPackagesByTag,
 getToursByActivitySlug,
 generateTourPDF,
 getTourPackageById,
} from '../controllers/tourPackageController.js';
import { fieldsUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js'; 




const tourPackageRoute = Router();


tourPackageRoute.post(
  '/',
  fieldsUpload([
    { name: 'gallery', maxCount: 20 },
    { name: 'googleMapImage', maxCount: 1 } ,
    { name: 'itineraryImages', maxCount: 30 }  
  ]),
  authenticate, authorizeRoles('admin'), 
  createTourPackage
);


tourPackageRoute.get('/search',   searchTourPackages);
tourPackageRoute.get('/filter-by-duration', filterByDuration);

tourPackageRoute.get('/', getAllTourPackages);


// Move this ABOVE the '/:id' route
// routes/tourPackageRoute.ts or similar
tourPackageRoute.get('/:id/similar', getRelatedPackages);




// Then keep this below

tourPackageRoute.get('/:id', getTourPackageById);





tourPackageRoute.put(
  '/:id',
  fieldsUpload([
    { name: 'gallery', maxCount: 20 },
    { name: 'googleMapImage', maxCount: 1 },
    { name: 'itineraryImages', maxCount: 30 }
  ]),
  authenticate, authorizeRoles('admin'), 
  updateTourPackage
);



tourPackageRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteTourPackage);

//special
tourPackageRoute.get('/tag/:tag', getTourPackagesByTag);

tourPackageRoute.get('/category/slug/:slug', getToursByActivitySlug);

tourPackageRoute.get("/:id/download-pdf", generateTourPDF);







export default tourPackageRoute;
