import { z } from "zod";

export const productFiltersSchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  skip: z.number().int().min(0).default(0),
});
