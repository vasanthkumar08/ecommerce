import bcrypt from "bcryptjs";
import User from "../../models/user.js";
import { graphQLError } from "../../utils/errors.js";
import { signAccessToken, signRefreshToken } from "../../utils/tokens.js";
import { loginUserSchema, registerUserSchema } from "./user.validation.js";

const publicUser = (user) => ({
  _id: user._id,
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUserService = async (input) => {
  const data = registerUserSchema.parse(input);
  const existing = await User.findOne({ email: data.email });

  if (existing) {
    throw graphQLError("User already exists", "BAD_USER_INPUT", 400);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role || "user",
  });

  return {
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
};

export const loginUserService = async (input) => {
  const data = loginUserSchema.parse(input);
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw graphQLError("Invalid credentials", "BAD_USER_INPUT", 400);
  }

  return {
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
};

export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw graphQLError("User not found", "NOT_FOUND", 404);
  }
  return publicUser(user);
};
