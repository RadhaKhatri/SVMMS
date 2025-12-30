import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post(
  "/login",
  (req, res, next) => {
    console.log("➡️ login route hit");
    next();
  },
  loginUser
);

router.get("/me", authenticateUser, (req, res) => {
  console.log("🔥 /api/auth/me HIT");
  res.json(req.user);
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router; // ✅ make sure "export default" is used
