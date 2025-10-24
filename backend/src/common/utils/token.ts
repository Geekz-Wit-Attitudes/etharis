import { AppError } from "../error";
import { DAY, HOUR, MINUTE } from "../constants/time";
import { tokenType } from "@/modules/auth/auth-types";

import type { TokenType } from "../../../generated/prisma";

import { HTTPException } from "hono/http-exception";
import { decode, sign, verify } from "hono/jwt";

export type JwtPayload = {
  sub: string;
  type: TokenType;
  duration: number;
  iat: number;
  exp: number;
};

export async function generateToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const tokenPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + payload.duration,
  };

  return sign(tokenPayload, secret);
}

export async function verifyToken(token: string, secret: string) {
  try {
    // Decode without verifying
    const { payload } = decode(token);

    // Manual expiration check
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new AppError("Failed to verify token, token is expired", 401);
    }

    // Verify signature after expiration check
    await verify(token, secret);

    return payload as JwtPayload;
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError("Invalid or expired token", 401);
  }
}

export function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

export const TOKEN_TTLS: Record<TokenType, number> = {
  [tokenType.access]: 3 * DAY,
  [tokenType.refresh]: 7 * DAY,
  [tokenType.passwordReset]: 15 * MINUTE,
  [tokenType.emailVerification]: 1 * HOUR,
};

export function getTimeToLive(type: TokenType): number {
  const ttl = TOKEN_TTLS[type];

  if (!ttl) throw new HTTPException(400, { message: "Invalid token type" });

  return ttl;
}
