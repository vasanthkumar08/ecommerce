import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
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
