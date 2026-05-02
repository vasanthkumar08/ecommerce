import Redis from "ioredis";
import logger from "../utils/logger.js";

let redisClient;

export const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on("error", (error) => {
      logger.warn("Redis unavailable", { message: error.message });
    });
  }

  return redisClient;
};

export default getRedisClient;
