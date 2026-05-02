import logger from "../utils/logger.js";

export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal server error";

  if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image file is too large"
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Only jpeg, png, webp, or gif image files are allowed"
          : message;
  } else if (err.name === "SyntaxError" && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON body";
  } else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Invalid input";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  }

  logger.error("Unhandled REST error", {
    message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : message,
  });
};
