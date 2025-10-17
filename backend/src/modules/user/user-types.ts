import type { UpdateUserSchema } from "./user-validation";

import type { User, Wallet } from "../../../generated/prisma";

import type z from "zod";

/**
 * ----------------------------------------
 * Request DTOs
 * ----------------------------------------
 */
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

/**
 * ----------------------------------------
 * Response DTOs
 * ----------------------------------------
 */
export type UserResponse = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  email_verified: boolean;
  wallet?: Wallet;
  created_at: Date;
  updated_at: Date;
  token?: string;
};

/**
 * ----------------------------------------
 * Mapper
 * ----------------------------------------
 */
export function toUserResponse(
  user: User & { wallet?: Wallet | null },
  token?: string
): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.toLowerCase(),
    email_verified: user.email_verified,
    wallet: user.wallet || undefined,
    created_at: user.created_at,
    updated_at: user.updated_at,
    token,
  };
}
