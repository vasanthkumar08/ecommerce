<<<<<<< HEAD
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const envName = process.env.NODE_ENV || "development";
const envFiles = [
  `../../.env.${envName}`,
  "../../.env",
].map((path) => fileURLToPath(new URL(path, import.meta.url)));

envFiles.forEach((path) => {
  if (existsSync(path)) {
    dotenv.config({ path, quiet: true, override: false });
  }
});

const requiredInProduction = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "CLIENT_URL",
];

const weakSecretValues = new Set([
  "change-me",
  "replace-me",
  "your-secret",
  "your_jwt_secret",
  "your_refresh_secret",
]);

const assertStrongSecret = (key) => {
  const value = process.env[key];
  if (!value || weakSecretValues.has(value) || value.length < 32) {
    throw new Error(`${key} must be set to a strong secret of at least 32 characters`);
  }
};

if (process.env.NODE_ENV === "production") {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required production env vars: ${missing.join(", ")}`);
  }

  assertStrongSecret("JWT_SECRET");
  assertStrongSecret("JWT_REFRESH_SECRET");
}
=======
const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "/api"
);

export const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "/graphql";

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

export const PLACEHOLDER_IMAGE = "https://placehold.co/600x600/f8fafc/2563eb?text=Product";
export const ADMIN_PLACEHOLDER_IMAGE = "https://placehold.co/160x160/020617/38bdf8?text=Product";
export const HERO_IMAGE_URL =
  import.meta.env.VITE_HERO_IMAGE_URL ||
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";
>>>>>>> f53fd6d (initial frontend commit - production ready)
