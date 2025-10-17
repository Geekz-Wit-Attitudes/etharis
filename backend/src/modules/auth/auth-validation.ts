import { UserRole } from "../../../generated/prisma/client";

import z from "zod";

// Registration request validation
export const RegisterSchema = z.object({
  email: z.email("Invalid email format").max(100),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100),
  name: z.string().min(2, "Name must be at least 2 characters long").max(100),
  role: z
    .enum(["brand", "creator"], "Role must be either 'brand' or 'creator'")
    .transform((val) => val.toUpperCase() as UserRole),
});

// Login request validation
export const LoginSchema = z.object({
  email: z.email("Invalid email format").max(100),
  password: z.string().min(6).max(100),
});

// Reset password request validation
export const ResetPasswordSchema = z.object({
  token: z.string().min(6).max(100),
  new_password: z.string().min(6).max(100),
});

// Change password request validation
export const ChangePasswordSchema = z.object({
  old_password: z.string().min(6).max(100),
  new_password: z.string().min(6).max(100),
});
