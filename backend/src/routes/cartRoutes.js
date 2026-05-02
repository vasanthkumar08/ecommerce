import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove-item/:cartItemId", protect, removeFromCart);
router.delete("/remove/:productId", protect, removeFromCart);

// ✅ THIS MUST EXIST
router.delete("/clear", protect, clearCart);

export default router;
