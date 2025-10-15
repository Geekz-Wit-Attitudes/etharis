// Zod Validation Schemas

import z from "zod";

// Registration request validation
export const RegisterSchema = z.object({
  email: z.email("Invalid email format").max(100),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100),
  name: z.string().min(2, "Name must be at least 2 characters long").max(100),
});

// Login request validation
export const LoginSchema = z.object({
  email: z.email("Invalid email format").max(100),
  password: z.string().min(6).max(100),
});
