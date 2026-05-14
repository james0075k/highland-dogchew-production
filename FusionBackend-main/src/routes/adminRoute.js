import { Router } from "express";
import {
  loginAdmin,
  registerAdmin,
  changeAdminPassword,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/adminController.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/authMiddleware/authMiddleware.js";
import { authLimiter } from "../middlewares/rateLimit/rateLimiters.js";

const adminRoute = Router();

adminRoute.post("/login", authLimiter, loginAdmin);
adminRoute.post("/register", authLimiter, registerAdmin);
adminRoute.post("/forgot-password", authLimiter, forgotPassword);
adminRoute.put("/reset-password/:token", authLimiter, resetPassword);

adminRoute.put("/change-password", authenticate, changeAdminPassword);
adminRoute.get("/", authenticate, getCurrentAdmin);

export default adminRoute;
