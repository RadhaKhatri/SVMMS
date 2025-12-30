import express from "express";
import {
  createService,
  getServices,
} from "../controllers/serviceController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateUser, getServices);
router.post("/", authenticateUser, createService);

export default router;
