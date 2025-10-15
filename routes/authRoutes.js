import express from "express";
import { 
  registerUser, 
  // createAgent,
  loginUser, 
  logoutUser, 
  getCurrentUser 
} from "../controllers/authController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
// router.post('/agent', protect, admin, createAgent); // Admin creates agents
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getCurrentUser);

export default router;