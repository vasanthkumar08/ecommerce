import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { updateProduct } from "../controllers/productController.js";

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from "../controllers/productController.js";

const router = express.Router();

// PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById);

// 🔥 ADMIN ONLY
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct); // ✅ ADD THIS
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
