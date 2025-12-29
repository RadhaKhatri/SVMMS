import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicleServices,
  getMyVehicles 
} from "../controllers/vehicleController.js";

const router = express.Router();

// CRUD
router.get("/", authenticateUser, getVehicles);
router.post("/", authenticateUser, addVehicle);
router.get("/my", authenticateUser, getMyVehicles);
router.get("/:id", authenticateUser, getVehicleById);
router.put("/:id", authenticateUser, updateVehicle);
router.delete("/:id", authenticateUser, deleteVehicle);

// Services for a vehicle
router.get("/:id/services", authenticateUser, getVehicleServices);

export default router;
