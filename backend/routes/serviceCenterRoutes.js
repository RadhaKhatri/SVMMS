import express from "express";
import { getServiceCenters } from "../controllers/serviceCenterController.js";

const router = express.Router();

router.get("/", getServiceCenters);

export default router;
