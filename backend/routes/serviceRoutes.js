import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  getServices,
  createService
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", authenticateUser, getServices);
router.post("/", authenticateUser, createService);

export default router;
