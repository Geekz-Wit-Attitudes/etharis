import { runWithAuditContext } from "../utils";
import type { Context, Next } from "hono";

export async function auditMiddleware(c: Context, next: Next) {
  const user = c.get("user");
  const context = {
    userId: user?.id,
    ipAddress:
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "-",
    userAgent: c.req.header("user-agent") || "-",
  };

  await runWithAuditContext(context, next);
}
