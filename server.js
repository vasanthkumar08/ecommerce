import connectDB from "./src/config/db.js";
import createApp from "./src/app.js";
import logger from "./src/utils/logger.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  await connectDB();
  const app = await createApp();

  server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully.`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      logger.info("HTTP server and DB connection closed");
      process.exit(0);
    });
    return;
  }

  await mongoose.connection.close(false);
  process.exit(0);
};

startServer().catch((error) => {
  logger.error("Failed to start server", { message: error.message, stack: error.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    message: reason?.message || String(reason),
    stack: reason?.stack,
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { message: error.message, stack: error.stack });
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
