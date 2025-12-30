import express from "express";
import { getAdminDashboardData,
        getAllCustomers,
        getCustomerFullDetails,
        getAllServiceCenters, 
        getServiceCenterDetails,
        getPartsCatalog,
        createPart,
        updatePart,
        getInventoryUsageLogs, 
        getMostUsedParts
} from "../controllers/adminController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * 🔒 Admin role guard (INLINE)
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* ================================
   ADMIN DASHBOARD ROUTE
================================ */
router.get(
  "/admin/dashboard",
  authenticateUser,
  adminOnly,
  getAdminDashboardData
);

// all customers
router.get(
  "/admin/users",
  authenticateUser,
  adminOnly,
  getAllCustomers
);

// single customer full details
router.get(
  "/admin/users/:id",
  authenticateUser,
  adminOnly,
  getCustomerFullDetails
);

// Service Center Routes
router.get("/admin/service_centers", authenticateUser, adminOnly, getAllServiceCenters);
router.get("/admin/service_centers/:id", authenticateUser, adminOnly, getServiceCenterDetails);

/* =====================================
   PARTS MASTER CATALOG (ADMIN ONLY)
===================================== */

// Get all master parts
router.get(
  "/admin/inventory/parts",
  authenticateUser,
  adminOnly,
  getPartsCatalog
);

// Create new master part
router.post(
  "/admin/inventory/parts",
  authenticateUser,
  adminOnly,
  createPart
);

// Update master part (price, description, etc.)
router.put(
  "/admin/inventory/parts/:id",
  authenticateUser,
  adminOnly,
  updatePart
);

/* =====================================
   INVENTORY USAGE LOGS (AUDIT)
===================================== */

// Parts usage from job cards
router.get(
  "/admin/inventory/usage-logs",
  authenticateUser,
  adminOnly,
  getInventoryUsageLogs
);

router.get(
  "/admin/inventory/most-used",
  authenticateUser,
  adminOnly,
  getMostUsedParts
);

export default router;
