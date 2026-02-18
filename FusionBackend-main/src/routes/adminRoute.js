import { Router } from "express";
import {
  loginAdmin,
  registerAdmin,
  changeAdminPassword,
  getCurrentAdmin
} from "../controllers/adminController.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/authMiddleware/authMiddleware.js";

const adminRoute = Router();

adminRoute.post("/login", loginAdmin);
adminRoute.post("/register", registerAdmin);

// ✅ Add authenticate middleware here
adminRoute.put("/change-password", authenticate, changeAdminPassword);
adminRoute.get("/", authenticate, getCurrentAdmin);

export default adminRoute;
