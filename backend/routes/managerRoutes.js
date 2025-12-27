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
  getPendingMechanicRequests ,
  getDashboardStats ,
  getInventory,
  getLowStockInventory,
  addOrUpdatePart,
  getInventoryLogs,
  getAllParts ,
  addJobTask,
  addJobPart,
  updateJobCardStatus,
  generateInvoice,
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

router.get(
  "/dashboard-stats",
  authenticateUser,
  managerOnly,
  getDashboardStats
);
router.get("/inventory/logs", authenticateUser, managerOnly, getInventoryLogs);
router.get("/inventory/low-stock", authenticateUser, managerOnly, getLowStockInventory);
router.get("/inventory", authenticateUser, managerOnly, getInventory);

router.get(
  "/parts",
  authenticateUser,
  managerOnly,
  getAllParts
);

router.post(
  "/job-cards/:id/tasks",
  authenticateUser,
  managerOnly,
  addJobTask
);
  
/**
 * 2️⃣ Add Spare Part Usage to Job Card
 * POST /api/manager/job-cards/:job_card_id/parts
 */
router.post(
  "/job-cards/:id/parts",
  authenticateUser,
  managerOnly,
  addJobPart
);

/**
 * 3️⃣ Update Job Card Status (open → in_progress → completed)
 * PATCH /api/manager/job-cards/:id/status
 */
router.patch(
  "/job-cards/:id/status",
  authenticateUser,
  managerOnly,
  updateJobCardStatus
);

/**
 * 4️⃣ Generate Invoice (after completion)
 * POST /api/manager/job-cards/:job_card_id/invoice
 */
router.post(
  "/job-cards/:id/invoice",
  authenticateUser, 
  managerOnly,
  generateInvoice
);

router.post("/inventory", authenticateUser, managerOnly, addOrUpdatePart);


export default router;
