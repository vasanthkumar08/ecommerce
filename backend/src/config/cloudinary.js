import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const assertCloudinaryConfigured = () => {
  const missing = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    const error = new Error(`Cloudinary is not configured. Missing: ${missing.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }
};

export const uploadBufferToCloudinary = (buffer, options = {}) => {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        quality: "auto",
        fetch_format: "auto",
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteCloudinaryAsset = async (publicId) => {
  assertCloudinaryConfigured();
  if (!publicId) {
    const error = new Error("Cloudinary publicId is required");
    error.statusCode = 400;
    throw error;
  }
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
};

export default cloudinary;
