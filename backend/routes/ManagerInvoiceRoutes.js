import express from "express";
import { getManagerInvoices, getInvoiceById,downloadInvoicePDF,sendInvoiceByEmail, markInvoiceAsPaid   } from "../controllers/ManagerInvoiceController.js";
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

/* CUSTOMER ROUTES */
router.get("/", authenticateUser, managerOnly, getManagerInvoices);
router.get("/:id", authenticateUser,managerOnly, getInvoiceById);
router.get("/:id/pdf", authenticateUser,managerOnly, downloadInvoicePDF);
router.post( "/:id/email", authenticateUser,managerOnly, sendInvoiceByEmail);
router.patch("/:id/pay", authenticateUser, managerOnly, markInvoiceAsPaid);

export default router;
