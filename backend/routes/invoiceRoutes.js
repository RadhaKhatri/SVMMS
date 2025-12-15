import express from "express";
import { getMyInvoices, getInvoiceById } from "../controllers/invoiceController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

/* CUSTOMER ROUTES */
router.get("/", authenticateUser, getMyInvoices);
router.get("/:id", authenticateUser, getInvoiceById);

export default router;
