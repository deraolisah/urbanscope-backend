import express from "express";
import upload from "../middlewares/upload.js";
import {
  addProperty,
  updateProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  getFeaturedProperties,
  getAgentProperties
} from "../controllers/propertyController.js";
import { protect, agent, admin, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get("/:id", getPropertyById);

// Protected routes
router.post("/", upload.array("images"), addProperty);
router.put("/:id", updateProperty);
router.delete("/:id", protect, agent, deleteProperty);
router.get("/agent/my-properties", protect, agent, getAgentProperties);

export default router;