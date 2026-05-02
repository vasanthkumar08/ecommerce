import jwt from "jsonwebtoken";
import crypto from "crypto";

const getSecret = (key) => {
  const secret = process.env[key];
  if (!secret) {
    throw new Error(`Missing ${key}`);
  }
  return secret;
};

export const signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, type: "access" }, getSecret("JWT_SECRET"), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "15m",
    issuer: process.env.JWT_ISSUER || "ecommerce-api",
    audience: process.env.JWT_AUDIENCE || "ecommerce-client",
  });

export const signRefreshToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, type: "refresh" }, getSecret("JWT_REFRESH_SECRET"), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "ecommerce-api",
    audience: process.env.JWT_AUDIENCE || "ecommerce-client",
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, getSecret("JWT_SECRET"), {
    issuer: process.env.JWT_ISSUER || "ecommerce-api",
    audience: process.env.JWT_AUDIENCE || "ecommerce-client",
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, getSecret("JWT_REFRESH_SECRET"), {
    issuer: process.env.JWT_ISSUER || "ecommerce-api",
    audience: process.env.JWT_AUDIENCE || "ecommerce-client",
  });

export const verifyToken = verifyAccessToken;

export const createCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

export const csrfCookieOptions = {
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};
