import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { tokenType } from "../../modules/auth/auth-types";
import { DAY, HOUR, MINUTE } from "../constants/time";
import type { TokenType } from "../../../generated/prisma";

export type JwtPayload = {
  id: string;
  email: string;
  ttlSeconds: number;
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
    exp: now + payload.ttlSeconds,
  };

  console.log("tokenPayload", tokenPayload);

  return sign(tokenPayload, secret);
}

export async function verifyToken(token: string, secret: string) {
  const payload = (await verify(token, secret)) as JwtPayload;

  // Optional: check expiration manually
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HTTPException(400, { message: "Token expired" });
  }

  return payload;
}

export const TOKEN_TTLS: Record<TokenType, number> = {
  [tokenType.access]: 3 * DAY,
  [tokenType.refresh]: 7 * DAY,
  [tokenType.passwordReset]: 15 * MINUTE,
  [tokenType.emailVerification]: 1 * HOUR,
};

export function getTTL(type: TokenType): number {
  const ttl = TOKEN_TTLS[type];

  if (!ttl) throw new HTTPException(400, { message: "Invalid token type" });

  return ttl;
}
