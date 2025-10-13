import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAgents
} from "../controllers/adminController.js";
import { protect, admin, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.get('/agents', getAgents);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, admin, deleteUser);

export default router;