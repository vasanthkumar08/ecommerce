import rateLimit from "express-rate-limit";
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import getRedisClient from "../config/redis.js";
import logger from "../utils/logger.js";

export const restRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || Number(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000),
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

export const uploadRateLimiter = rateLimit({
  windowMs: Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.UPLOAD_RATE_LIMIT_MAX || 60),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many upload attempts. Please try again later." },
});

const redisClient = getRedisClient();

export const graphQLRateLimiter = redisClient
  ? new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: "gql_rl",
      points: Number(process.env.GRAPHQL_RATE_LIMIT_MAX || 120),
      duration: Number(process.env.GRAPHQL_RATE_LIMIT_WINDOW_SECONDS || 60),
    })
  : new RateLimiterMemory({
      points: Number(process.env.GRAPHQL_RATE_LIMIT_MAX || 120),
      duration: Number(process.env.GRAPHQL_RATE_LIMIT_WINDOW_SECONDS || 60),
    });

export const consumeGraphQLRateLimit = async (key) => {
  try {
    await graphQLRateLimiter.consume(key);
  } catch (error) {
    if (error?.msBeforeNext) {
      throw error;
    }
    logger.warn("GraphQL rate limiter failed open", { message: error.message });
  }
};
