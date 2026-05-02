import User from "../../models/user.js";
import { verifyToken } from "../../utils/tokens.js";
import { createLoaders } from "../loaders/index.js";
import { consumeGraphQLRateLimit } from "../../middleware/rateLimiter.js";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return req.cookies?.accessToken || null;
};

export const createGraphQLContext = async ({ req, res }) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  await consumeGraphQLRateLimit(ip);

  let user = null;
  const token = getTokenFromRequest(req);

  if (token) {
    try {
      const decoded = verifyToken(token);
      user = await User.findById(decoded.id).select("-password");
    } catch {
      user = null;
    }
  }

  return {
    req,
    res,
    user,
    loaders: createLoaders(),
  };
};

export default createGraphQLContext;
