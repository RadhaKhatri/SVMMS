import express from "express";
import { getMyInvoices, getInvoiceById,downloadInvoicePDF} from "../controllers/invoiceController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔒 Manager role guard (INLINE)
 */
const customer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* CUSTOMER ROUTES */  
router.get("/", authenticateUser,customer, getMyInvoices);
router.get("/:id", authenticateUser,customer, getInvoiceById);
router.get("/:id/pdf", authenticateUser,customer, downloadInvoicePDF);

export default router;
