import type z from "zod";
import {
  type User,
  TokenType as PrismaTokenType,
} from "../../../generated/prisma";
import type { LoginSchema, RegisterSchema } from "./auth-validation";

// Request DTOs
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;

// Response DTOs

// Token Type
export const tokenType = {
  access: PrismaTokenType.ACCESS,
  refresh: PrismaTokenType.REFRESH,
  emailVerification: PrismaTokenType.EMAIL_VERIFICATION,
  passwordReset: PrismaTokenType.PASSWORD_RESET,
} as const;
