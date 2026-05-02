import User from "../../models/user.js";
import {
  getUserProfileService,
  loginUserService,
  registerUserService,
} from "../../modules/user/user.service.js";
import {
  authCookieOptions,
  createCsrfToken,
  csrfCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokens.js";
import { graphQLError, requireAuth } from "../../utils/errors.js";

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const csrfToken = createCsrfToken();

  res.cookie("accessToken", accessToken, {
    ...authCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("csrfToken", csrfToken, {
    ...csrfCookieOptions,
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const getRefreshToken = (req) =>
  req.cookies?.refreshToken || req.headers["x-refresh-token"] || null;

export const userResolvers = {
  Query: {
    getUserProfile: async (_, __, { user }) => {
      requireAuth(user);
      return getUserProfileService(user._id);
    },
  },
  Mutation: {
    registerUser: async (_, { input }, { res }) => {
      const payload = await registerUserService(input);
      setAuthCookies(res, payload);
      return payload;
    },
    loginUser: async (_, { input }, { res }) => {
      const payload = await loginUserService(input);
      setAuthCookies(res, payload);
      return payload;
    },
    logoutUser: async (_, __, { res }) => {
      res.clearCookie("accessToken", authCookieOptions);
      res.clearCookie("refreshToken", authCookieOptions);
      res.clearCookie("csrfToken", csrfCookieOptions);
      return true;
    },
    refreshToken: async (_, __, { req, res }) => {
      const token = getRefreshToken(req);
      if (!token) {
        throw graphQLError("Refresh token required", "UNAUTHENTICATED", 401);
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(token);
      } catch {
        throw graphQLError("Invalid refresh token", "UNAUTHENTICATED", 401);
      }

      if (decoded.type !== "refresh") {
        throw graphQLError("Invalid refresh token", "UNAUTHENTICATED", 401);
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        throw graphQLError("User not found", "UNAUTHENTICATED", 401);
      }

      const payload = {
        user,
        accessToken: signAccessToken(user),
        refreshToken: signRefreshToken(user),
      };
      setAuthCookies(res, payload);
      return payload;
    },
  },
  User: {
    id: (user) => user.id || user._id?.toString(),
    _id: (user) => user._id?.toString() || user.id,
  },
};

export default userResolvers;
