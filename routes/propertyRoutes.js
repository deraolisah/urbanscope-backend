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
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get("/:id", getPropertyById);

// Protected routes
router.post("/", protect, admin, upload.array("images"), addProperty);
// router.put("/:id", protect, admin, updateProperty);
router.put("/:id", protect, admin, upload.array("images", 10), updateProperty);
router.delete("/:id", protect, admin, deleteProperty);
router.get("/agent/my-properties", protect, admin, getAgentProperties);

export default router;