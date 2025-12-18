import express from "express";
import {
  getMyServiceCenter,
  registerServiceCenter,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  getMyMechanics,
  getManagerProfile,
  updateManagerProfile,
  getJobCardDetail,
  getJobCardsList,
  rejectMechanic,
  approveMechanic ,
  getPendingMechanicRequests 
} from "../controllers/managerController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔒 Manager role guard (INLINE)
 */
const managerOnly = (req, res, next) => {
  if (req.user.role !== "service_center_manager") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* ===============================
   SERVICE CENTER
================================ */
router.get(
  "/service-center",
  authenticateUser,
  managerOnly,
  getMyServiceCenter
);

router.post(
  "/service-center",
  authenticateUser,
  managerOnly,
registerServiceCenter);

/* ===============================
   BOOKINGS
================================ */
router.get(
  "/bookings/pending",
  authenticateUser,
  managerOnly,
  getPendingBookings
);

router.post(
  "/bookings/:id/approve",
  authenticateUser,
  managerOnly,
  approveBooking
);

router.post(
  "/bookings/:id/reject",
  authenticateUser,
  managerOnly,
  rejectBooking
);

/* ===============================
   MECHANICS
================================ */
router.get(
  "/mechanics",
  authenticateUser,
  managerOnly,
  getMyMechanics
);

router.get("/profile", authenticateUser, getManagerProfile);

router.put("/profile", authenticateUser, updateManagerProfile);

router.get("/job-cards", authenticateUser, getJobCardsList);
router.get("/job-cards/:id", authenticateUser, getJobCardDetail);


/**
 * View pending mechanic requests
 */
router.get(
  "/mechanics/requests",
  authenticateUser,
  managerOnly,
  getPendingMechanicRequests
);

/**
 * Approve mechanic request
 */
router.post(
  "/mechanics/requests/:id/approve",
  authenticateUser,
  managerOnly,
  approveMechanic
);

/**
 * Reject mechanic request
 */
router.post(
  "/mechanics/requests/:id/reject",
  authenticateUser,
  managerOnly,
  rejectMechanic
);


export default router;
