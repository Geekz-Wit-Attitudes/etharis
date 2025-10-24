import { prismaClient } from "@/common/config/database";
import type { GlobalTypes } from "@/common/types/global-types";
import { env } from "@/common/config/env";
import { errorHandler } from "@/common/error/error-handler";
import { authRoutes } from "@/modules/auth/auth-routes";
import { userRoutes } from "@/modules/user/user-routes";
import { dealRoutes } from "@/modules/deal/deal-routes";

import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Variables: GlobalTypes }>();

// Enable CORS only in development
if (env.nodeEnv === "development") {
  app.use("*", cors({ origin: "*" }));
}

/**
 * ----------------------------------------
 * Mount feature routes
 * ----------------------------------------
 */

// Versioned API grouping
const v1 = new Hono<{ Variables: GlobalTypes }>();

/**
 * ----------------------------------------
 * Mount feature routes
 * ----------------------------------------
 */
v1.route("/auth", authRoutes);
v1.route("/user", userRoutes);
v1.route("/deal", dealRoutes);

// Documentation
v1.get("/docs", (c) =>
  c.redirect("https://documenter.getpostman.com/view/49280329/2sB3Wjyiid", 301)
);

// Attach /api routes to main app
app.route("/api/v1", v1);

/**
 * ----------------------------------------
 * Health check or root endpoint
 * ----------------------------------------
 */
app.get("/", (c) =>
  c.json({ status: "ok", version: "v1", message: "API is running" })
);

/**
 * ----------------------------------------
 * Global error handler
 * ----------------------------------------
 */
app.onError(errorHandler);

export default app;
