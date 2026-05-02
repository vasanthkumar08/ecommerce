import {
  deleteCloudinaryAsset,
  uploadBufferToCloudinary,
} from "../config/cloudinary.js";

const folderByType = {
  product: "ecommerce/products",
  category: "ecommerce/categories",
  banner: "ecommerce/banners",
  profile: "ecommerce/profiles",
};

const transformationByType = {
  product: [{ width: 1200, height: 1200, crop: "limit" }],
  category: [{ width: 900, height: 600, crop: "fill", gravity: "auto" }],
  banner: [{ width: 1920, height: 700, crop: "fill", gravity: "auto" }],
  profile: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
};

const normalizeType = (value) => (folderByType[value] ? value : "product");

const hasValidImageSignature = (file) => {
  const buffer = file?.buffer;
  if (!buffer || buffer.length < 12) return false;

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isGif = buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a";
  const isWebp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isJpeg || isPng || isGif || isWebp;
};

const uploadResponse = (result) => ({
  url: result.secure_url,
  secureUrl: result.secure_url,
  publicId: result.public_id,
  width: result.width,
  height: result.height,
  format: result.format,
  bytes: result.bytes,
});

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!hasValidImageSignature(req.file)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    const type = normalizeType(req.body.type || req.query.type || req.params.type);
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: folderByType[type],
      transformation: transformationByType[type],
    });

    res.status(201).json(uploadResponse(result));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const replaceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!hasValidImageSignature(req.file)) {
      return res.status(400).json({ message: "Invalid image file" });
    }

    const publicId = req.body.publicId || req.query.publicId || req.params.publicId;
    if (!publicId) {
      return res.status(400).json({ message: "Cloudinary publicId is required" });
    }

    const type = normalizeType(req.body.type || req.query.type || req.params.type);
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: publicId,
      folder: publicId.includes("/") ? undefined : folderByType[type],
      transformation: transformationByType[type],
    });

    res.json(uploadResponse(result));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const publicId = req.body.publicId || req.query.publicId || req.params.publicId;
    const result = await deleteCloudinaryAsset(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(502).json({ message: "Cloudinary delete failed", result });
    }

    res.json({ message: "Image deleted successfully", result: result.result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
