import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import type { Context, Next } from "hono";
import type { GlobalTypes } from "../types/global-types";
import type { JwtPayload } from "../utils/token";

export async function authMiddleware(
  c: Context<{ Variables: GlobalTypes }>,
  next: Next
) {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  const jwtSecret = c.get("jwtSecret");
  const prismaClient = c.get("prismaClient");

  if (!token) throw new HTTPException(401, { message: "Unauthorized request" });

  try {
    const payload = (await verify(token, jwtSecret)) as JwtPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new HTTPException(401, { message: "User not found" });
    }

    c.set("user", user);
    await next();
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
}
