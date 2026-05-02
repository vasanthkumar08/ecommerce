import { isDatabaseConnected } from "../config/db.js";

export const requireDatabase = (req, res, next) => {
  if (isDatabaseConnected()) {
    next();
    return;
  }

  res.status(503).json({
    message: "Database is not connected. Check MONGO_URI or start MongoDB.",
  });
};

export default requireDatabase;
