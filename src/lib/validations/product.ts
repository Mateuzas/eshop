import { z } from "zod/v4";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().max(5000).default(""),
  priceCents: z.number().int().min(1, "Price must be at least 1 cent"),
  stockQty: z.number().int().min(0).default(1),
  category: z.string().max(100).nullable().optional(),
  images: z.array(z.string()).max(8).default([]),
  videoUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
