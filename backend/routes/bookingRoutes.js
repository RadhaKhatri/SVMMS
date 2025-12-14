import express from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking
} from "../controllers/bookingController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createBooking);
router.get("/", authenticateUser, getMyBookings);
router.put("/:id/cancel", authenticateUser, cancelBooking);

export default router;
