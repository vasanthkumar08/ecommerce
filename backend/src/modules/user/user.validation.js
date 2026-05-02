import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: strongPassword,
  role: z.enum(["user", "admin"]).optional(),
});

export const loginUserSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});
