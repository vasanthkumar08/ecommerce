import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { deleteImage, replaceImage, uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, upload.single("image"), uploadImage);
router.post("/profile", protect, upload.single("image"), uploadImage);
router.post("/:type", protect, adminOnly, upload.single("image"), uploadImage);
router.put("/", protect, adminOnly, upload.single("image"), replaceImage);
router.put("/profile", protect, upload.single("image"), replaceImage);
router.put("/:type", protect, adminOnly, upload.single("image"), replaceImage);
router.delete("/", protect, adminOnly, deleteImage);
router.delete("/:publicId", protect, adminOnly, deleteImage);

export default router;
