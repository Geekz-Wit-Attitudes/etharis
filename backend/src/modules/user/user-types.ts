import type z from "zod";
import type { User } from "../../../../generated/prisma";
import type { UpdateUserSchema } from "./user-validation";

// Request DTOs
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

// Response DTOs
export type UserResponse = {
  id: string;
  email: string;
  name?: string;
  wallet?: string;
  email_verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
};

// Mapper
export function toUserResponse(user: User, token?: string): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    wallet: user.wallet ?? undefined,
    email_verified: user.email_verified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
  };
}
