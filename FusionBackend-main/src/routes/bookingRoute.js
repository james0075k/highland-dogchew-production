import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware/authMiddleware.js";

const BookingRoute = Router()

BookingRoute.post("/",  createBooking);
BookingRoute.get("/",  getAllBookings);
BookingRoute.get("/:id", getBookingById);
BookingRoute.put("/:id", updateBooking);
BookingRoute.delete("/:id", authenticate, authorizeRoles('admin'),  deleteBooking);

export default BookingRoute; 
