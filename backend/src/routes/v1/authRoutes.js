import express from "express";
import {
  signupController,
  signinController,
  logoutController,
  getProfileController,
  getAllUsersController,
} from "../../controllers/authController.js";
import {
  validateSignup,
  validateSignin,
} from "../../validators/authValidator.js";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", validateSignup, signupController);
router.post("/register", validateSignup, signupController);
router.post("/signin", validateSignin, signinController);
router.post("/login", validateSignin, signinController);
router.post("/logout", logoutController);

// Authenticated routes (Accessible to any logged-in user)
router.get("/me", authenticate, getProfileController);
router.get("/profile", authenticate, getProfileController);

// Authorized routes (Role-based access: Admin only)
router.get("/users", authenticate, authorize("admin"), getAllUsersController);

export default router;
