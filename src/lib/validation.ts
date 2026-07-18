import { z } from "zod";

export const createConsumableSchema = z.object({
  name: z.string().min(2).max(100),
  sku: z.string().min(2).max(50),
  unit: z.string().min(1).max(20),
  minLevel: z.coerce.number().int().min(0),
  quantity: z.coerce.number().int().min(0),
  location: z.string().max(80).optional().or(z.literal(""))
});

export const createMovementSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().min(1),
  note: z.string().max(200).optional().or(z.literal(""))
});
