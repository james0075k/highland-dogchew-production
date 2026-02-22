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

const adminRoute = Router();

adminRoute.post("/login", loginAdmin);
adminRoute.post("/register", registerAdmin);
adminRoute.post("/forgot-password", forgotPassword);
adminRoute.put("/reset-password/:token", resetPassword);

adminRoute.put("/change-password", authenticate, changeAdminPassword);
adminRoute.get("/", authenticate, getCurrentAdmin);

export default adminRoute;
