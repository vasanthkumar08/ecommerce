import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxFileSize = Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || 5 * 1024 * 1024);
const allowedExtensions = /\.(jpe?g|png|webp|gif)$/i;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.test(file.originalname || "")) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
      return;
    }
    callback(null, true);
  },
});

export default upload;
export { cloudinary };
