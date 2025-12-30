import express from "express";
import {
  exportReportExcel,
  exportReportPDF,
  getBookingsByService,
  getBookingsByStatus,
  getCityWiseRevenue,
  getCustomerReport,
  getDetailedJobReport,
  getDetailedRevenueReport,
  getInventoryReport,
  getMechanicPerformance,
  getMonthlyTrend,
  getPeakServiceTime,
  getReportsSummary,
  getServiceCenterPerformance,
  sendReportEmail,
} from "../controllers/adminReportsController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* ================= REPORT ROUTES ================= */

router.get(
  "/admin/reports/summary",
  authenticateUser,
  adminOnly,
  getReportsSummary
);

router.get(
  "/admin/reports/revenue/detailed",
  authenticateUser,
  adminOnly,
  getDetailedRevenueReport
);

router.get(
  "/admin/reports/jobs/detailed",
  authenticateUser,
  adminOnly,
  getDetailedJobReport
);

router.get(
  "/admin/reports/service-centers",
  authenticateUser,
  adminOnly,
  getServiceCenterPerformance
);

router.get(
  "/admin/reports/mechanics",
  authenticateUser,
  adminOnly,
  getMechanicPerformance
);

router.get(
  "/admin/reports/customers",
  authenticateUser,
  adminOnly,
  getCustomerReport
);

router.get(
  "/admin/reports/inventory",
  authenticateUser,
  adminOnly,
  getInventoryReport
);

router.get(
  "/admin/reports/bookings/services",
  authenticateUser,
  adminOnly,
  getBookingsByService
);
router.get(
  "/admin/reports/bookings/status",
  authenticateUser,
  adminOnly,
  getBookingsByStatus
);

router.get(
  "/admin/reports/locations/city-revenue",
  authenticateUser,
  adminOnly,
  getCityWiseRevenue
);

router.get(
  "/admin/reports/time/peak",
  authenticateUser,
  adminOnly,
  getPeakServiceTime
);
router.get(
  "/admin/reports/time/monthly",
  authenticateUser,
  adminOnly,
  getMonthlyTrend
);

/* ===== EXPORT & EMAIL ===== */

router.post(
  "/admin/reports/export/pdf",
  authenticateUser,
  adminOnly,
  exportReportPDF
);

router.post(
  "/admin/reports/export/excel",
  authenticateUser,
  adminOnly,
  exportReportExcel
);

router.post(
  "/admin/reports/email",
  authenticateUser,
  adminOnly,
  sendReportEmail
);

export default router;
