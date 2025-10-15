/**
 * --------------------
 * Zod Validation Schemas
 * --------------------
 */

import z from "zod";

// Update request validation
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(6).max(100).optional(),
});
