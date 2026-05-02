import { z } from "zod";

export const cartItemInputSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const updateCartQuantitySchema = z.object({
  product: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});
