import express from "express";
import upload from "../middlewares/upload.js";
import {
  addProperty,
  updateProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  getFeaturedProperties
} from "../controllers/propertyController.js";

const router = express.Router();

router.post("/", upload.array("images"), addProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);
router.get("/", getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get("/:id", getPropertyById);


export default router;