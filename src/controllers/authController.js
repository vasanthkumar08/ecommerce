import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { loginUserSchema, registerUserSchema } from "../modules/user/user.validation.js";
import {
  authCookieOptions,
  createCsrfToken,
  csrfCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const setAuthCookies = (res, accessToken, refreshToken) => {
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

const zodMessage = (error) => error.issues?.map((issue) => issue.message).join(", ") || error.message;

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = registerUserSchema.parse(req.body);

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, token, refreshToken);

    res.status(201).json({
      user: publicUser(user),
      token,
      accessToken: token,
      refreshToken,
    });

  } catch (err) {
    res.status(err.name === "ZodError" ? 400 : 500).json({ message: err.name === "ZodError" ? zodMessage(err) : err.message });
  }
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, token, refreshToken);

    res.json({
      user: publicUser(user),
      token,
      accessToken: token,
      refreshToken,
    });

  } catch (err) {
    res.status(err.name === "ZodError" ? 400 : 500).json({ message: err.name === "ZodError" ? zodMessage(err) : err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const email = req.body.email?.trim().toLowerCase();
    const updates = {};

    if (req.body.name) updates.name = req.body.name.trim();
    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updates.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.headers["x-refresh-token"];
    if (!token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(token);
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: publicUser(user),
      token: accessToken,
      accessToken,
      refreshToken,
    });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("accessToken", authCookieOptions);
  res.clearCookie("refreshToken", authCookieOptions);
  res.clearCookie("csrfToken", csrfCookieOptions);
  res.json({ message: "Logged out successfully" });
};
