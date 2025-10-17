import type { UserRole } from "../../../generated/prisma";

import z from "zod";

// Update User Validation
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z
    .enum(["brand", "creator"])
    .transform((val) => val.toUpperCase() as UserRole)
    .optional(),
});
