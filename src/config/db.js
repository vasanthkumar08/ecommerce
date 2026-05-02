import { connect } from "mongoose";
import "./env.js";
import logger from "../utils/logger.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    maxAttempts: Number(process.env.MONGO_CONNECT_RETRIES || (isProduction ? 5 : 0)),
    retryDelayMs: Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS || 5000),
  };
};

const shouldRetry = (attempt, maxAttempts) => maxAttempts === 0 || attempt < maxAttempts;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI");
  }

  const options = {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 50),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    autoIndex: process.env.NODE_ENV !== "production",
  };
  const { maxAttempts, retryDelayMs } = getRetryConfig();
  let attempt = 0;

  while (true) {
    attempt += 1;

    try {
      await connect(process.env.MONGO_URI, options);
      logger.info("DB connected");
      return;
    } catch (error) {
      if (!shouldRetry(attempt, maxAttempts)) {
        throw error;
      }

      logger.warn("DB connection failed; retrying", {
        attempt,
        nextRetryMs: retryDelayMs,
        message: error.message,
      });

      await wait(retryDelayMs);
    }
  }
};

export default connectDB;
