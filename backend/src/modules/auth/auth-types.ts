import type {
  ChangePasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "@/modules/auth";
import type { UserResponse } from "@/modules/user";

import { TokenType } from "../../../generated/prisma";

import type z from "zod";
/**
 * ----------------------------------------
 * Request DTOs
 * ----------------------------------------
 */
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;

/**
 * ----------------------------------------
 * Response DTOs
 * ----------------------------------------
 */
export type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

export type LoginResponse = {
  user: UserResponse;
  token: TokenResponse;
};

export const contractStatus = {
  PENDING: 0,
  ACTIVE: 1,
  PENDING_REVIEW: 2,
  DISPUTED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
} as const;

export type ContractStatus =
  (typeof contractStatus)[keyof typeof contractStatus];

/**
 * ----------------------------------------
 * Mapper
 * ----------------------------------------
 */
export function toTokenResponse(
  access_token: string,
  refresh_token: string
): TokenResponse {
  return {
    access_token,
    refresh_token,
  };
}

// Token Type
export const tokenType = {
  access: TokenType.ACCESS,
  refresh: TokenType.REFRESH,
  emailVerification: TokenType.EMAIL_VERIFICATION,
  passwordReset: TokenType.PASSWORD_RESET,
} as const;
