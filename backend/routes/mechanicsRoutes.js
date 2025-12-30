import express from "express";
import {
  addJobPart,
  addJobTask,
  completeJobTask,
  generateInvoice,
  getAvailableParts,
  getMechanicProfile,
  getMechanicSchedule,
  getMyJobCardDetail,
  getMyJobCards,
  getMyServiceCenterRequests,
  getServiceCenters,
  requestServiceCenter,
  saveJobNotes,
  updateJobStatus,
  updateMechanicProfile,
} from "../controllers/mechanicsController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔒 Mechanic role guard (INLINE)
 * Same pattern as managerOnly
 */
const mechanicOnly = (req, res, next) => {
  if (req.user.role !== "mechanic") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* ===============================
   MECHANIC PROFILE
================================ */

/**
 * GET mechanic profile
 * GET /api/mechanic/profile
 */
router.get("/profile", authenticateUser, mechanicOnly, getMechanicProfile);

/**
 * UPDATE mechanic profile
 * PUT /api/mechanic/profile
 */
router.put("/profile", authenticateUser, mechanicOnly, updateMechanicProfile);

/**
 * List all service centers
 * + show my request status
 */
// 🔹 List all service centers + request status
router.get(
  "/request-center",
  authenticateUser,
  mechanicOnly,
  getServiceCenters
);

// 🔹 Request a service center
router.post(
  "/request-center/:id",
  authenticateUser,
  mechanicOnly,
  requestServiceCenter
);

// 🔹 Get my requests
router.get(
  "/my-requests",
  authenticateUser,
  mechanicOnly,
  getMyServiceCenterRequests
);

router.get("/job-cards", authenticateUser, mechanicOnly, getMyJobCards);
router.get(
  "/job-cards/:id",
  authenticateUser,
  mechanicOnly,
  getMyJobCardDetail
);
router.patch(
  "/job-cards/:id/status",
  authenticateUser,
  mechanicOnly,
  updateJobStatus
);
router.post("/job-cards/:id/tasks", authenticateUser, mechanicOnly, addJobTask);

router.post("/job-cards/:id/parts", authenticateUser, mechanicOnly, addJobPart);

router.patch(
  "/job-cards/:id/notes",
  authenticateUser,
  mechanicOnly,
  saveJobNotes
);

router.post(
  "/job-cards/:id/invoice",
  authenticateUser,
  mechanicOnly,
  generateInvoice
);

router.get(
  "/job-cards/:id/tasks",
  authenticateUser,
  mechanicOnly,
  async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM job_tasks WHERE job_card_id=$1",
      [req.params.id]
    );
    res.json(result.rows);
  }
);

router.get(
  "/job-cards/:id/parts",
  authenticateUser,
  mechanicOnly,
  async (req, res) => {
    const result = await pool.query(
      `SELECT jp.*, p.name
       FROM job_parts jp
       JOIN parts p ON p.id = jp.part_id
       WHERE jp.job_card_id=$1`,
      [req.params.id]
    );
    res.json(result.rows);
  }
);

router.get(
  "/job-cards/:jobCardId/available-parts",
  authenticateUser,
  mechanicOnly,
  getAvailableParts
);

router.patch(
  "/job-cards/:jobCardId/tasks/:taskId/complete",
  authenticateUser,
  mechanicOnly,
  completeJobTask
);

router.get("/schedule", authenticateUser, mechanicOnly, getMechanicSchedule);

export default router;
