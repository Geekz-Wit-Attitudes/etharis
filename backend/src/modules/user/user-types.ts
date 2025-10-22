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
  wallet?: WalletResponse;
  created_at: Date;
  updated_at: Date;
  token?: string;
};

export type WalletResponse = Wallet & { balance?: string };

/**
 * ----------------------------------------
 * Mapper
 * ----------------------------------------
 */

export function toWalletResponse(
  wallet: Wallet & { balance?: string }
): WalletResponse {
  return {
    id: wallet.id,
    user_id: wallet.user_id,
    address: wallet.address,
    balance: wallet.balance,
    secret_path: wallet.secret_path,
    created_at: wallet.created_at,
  };
}

export function toUserResponse(
  user: User & { wallet?: WalletResponse | null },
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
