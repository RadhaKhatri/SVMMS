import express from "express";
import {
  getCustomerDashboardStats,
  getRecentServices,
} from "../controllers/dashboardController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", authenticateUser, getCustomerDashboardStats);
router.get("/recent-services", authenticateUser, getRecentServices);

export default router;
