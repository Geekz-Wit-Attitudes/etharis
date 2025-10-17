import { Hono } from "hono";
import { userRoutes } from "./modules/user/user-routes";
import { prismaClient } from "./common/config/database";
import type { GlobalTypes } from "./common/types/global-types";
import { env } from "./common/config/env";
import { errorHandler } from "./common/error/error-handler";
import { authRoutes } from "./modules/auth/auth-routes";
import { cors } from "hono/cors";

const app = new Hono<{ Variables: GlobalTypes }>();

// Enable CORS only in development
if (env.nodeEnv === "development") {
  app.use("*", cors({ origin: "*" }));
}

app.use("*", async (c, next) => {
  c.set("prismaClient", prismaClient);
  c.set("jwtSecret", env.jwtSecret);

  await next();
});

// Versioned API grouping
const v1 = new Hono<{ Variables: GlobalTypes }>();

// Mount feature routes
v1.route("/users", userRoutes);
v1.route("/auth", authRoutes);

// Attach /api routes to main app
app.route("/api/v1", v1);

// Health check or root endpoint
app.get("/", (c) =>
  c.json({ status: "ok", version: "v1", message: "API is running" })
);

app.onError(errorHandler);

export default app;
