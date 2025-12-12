import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", (req, res, next) => {
  console.log("➡️ login route hit");
  next();
}, loginUser);


export default router; // ✅ make sure "export default" is used
