import { Router } from 'express';
const blogRoute = Router();
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,   
  getBlogsByCategory,
  getRelatedBlogs

} from '../controllers/blogController.js';
import { singleUpload } from '../middlewares/MulterMiddleware/multerMiddleware.js';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware/authMiddleware.js'; 





blogRoute.post('/', singleUpload('imageUrl'), authenticate, authorizeRoles('admin'),  createBlog);
blogRoute.get('/related', getRelatedBlogs);
blogRoute.get('/:slug', getBlogBySlug);
blogRoute.get('/category/:category', getBlogsByCategory);
blogRoute.put('/:id', singleUpload('imageUrl'), authenticate, authorizeRoles('admin'),  updateBlog);
blogRoute.delete('/:id', authenticate, authorizeRoles('admin'),  deleteBlog);
blogRoute.get('/', getAllBlogs);



export default blogRoute;


