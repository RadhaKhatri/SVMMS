import express from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingById,
  completeJobCard,
  completeJobTask ,
  getTaskProgressByBooking,
  getJobProgressByBooking 
} from "../controllers/bookingController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createBooking);
router.get("/", authenticateUser, getMyBookings);
router.put("/:id/cancel", authenticateUser, cancelBooking);
router.get("/:id", authenticateUser, getBookingById);
router.delete("/:id", authenticateUser, deleteBooking);
router.patch("/:id/status", authenticateUser, updateBookingStatus);
router.patch("/:id/cancel", authenticateUser, cancelBooking);
router.patch(
  "/job-cards/:jobCardId/complete",
  authenticateUser,
  completeJobCard
);

router.patch("/tasks/:taskId/complete", authenticateUser, completeJobTask);
router.get("/:bookingId/task-progress", authenticateUser, getTaskProgressByBooking);
router.get(
  "/:id/job-progress",
  authenticateUser,
  getJobProgressByBooking
);

export default router;
