import { Router } from "express";
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactStatus,
  deleteContactMessage,
} from "../controllers/contactController.js";

import { authenticate, authorizeRoles } from "../middlewares/authMiddleware/authMiddleware.js";
import { contactLimiter } from "../middlewares/rateLimit/rateLimiters.js";

const contactRoute = Router();

// Public: send message — rate-limited to prevent spam
contactRoute.post("/", contactLimiter, createContactMessage);

// Admin: manage messages
contactRoute.get("/",   getAllContactMessages);
contactRoute.get("/:id", getContactMessageById);
contactRoute.patch("/:id/status", authenticate, authorizeRoles("admin"), updateContactStatus);
contactRoute.delete("/:id", authenticate, authorizeRoles("admin"), deleteContactMessage);

export default contactRoute;
