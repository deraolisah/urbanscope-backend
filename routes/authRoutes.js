import express from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  forgotPassword,
  verifyResetCode,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;