import { Hono } from "hono";
import { authController } from "./auth-controller";
import { authMiddleware } from "../../common/middleware/auth-middleware";
import type { GlobalTypes } from "../../common/types/global-types";

export const authRoutes = new Hono<{ Variables: GlobalTypes }>();

// Public routes (no auth)
authRoutes.route("/", authController.publicRoutes);

// Protected routes (with auth middleware)
authRoutes.use("*", authMiddleware);
authRoutes.route("/", authController.protectedRoutes);
