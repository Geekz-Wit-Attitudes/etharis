import { env, prismaClient } from "../config";
import { catchOrThrow, AppError } from "../error";
import type { GlobalTypes } from "../types";
import { getAuditContext, extractBearerToken, verifyToken } from "../utils";

import { TokenType } from "../../../generated/prisma";

import { HTTPException } from "hono/http-exception";
import type { Context, Next } from "hono";

export async function authMiddleware(
  c: Context<{ Variables: GlobalTypes }>,
  next: Next
) {
  return catchOrThrow(async () => {
    // Extract authorization header
    const header = c.req.header("Authorization");
    const token = extractBearerToken(header);

    if (!token) {
      throw new HTTPException(401, { message: "Unauthorized request" });
    }

    const payload = await verifyToken(token, env.jwtSecret);

    // Only allow access tokens for authentication
    if (payload.type !== TokenType.ACCESS) {
      throw new AppError("Failed to verify token, invalid token type", 401);
    }

    const user = await prismaClient.user.findUnique({
      where: { id: payload.sub },
      include: { wallet: true },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    c.set("user", user);

    if (user) {
      const ctx = getAuditContext();
      ctx.userId = user.id;
    }

    await next();
  });
}
