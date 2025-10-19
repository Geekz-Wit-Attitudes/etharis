import { userController } from "./user-controller";
import { authMiddleware, endpoints, type GlobalTypes } from "@/common";

import { Hono } from "hono";

export const userRoutes = new Hono<{ Variables: GlobalTypes }>();

const { profile } = endpoints.user;

// Apply auth middleware
userRoutes.use("*", authMiddleware);

/**
 * ----------------------------------------
 * Mount user controller
 * ----------------------------------------
 */
userRoutes.get(profile, userController.handleGetProfile);
userRoutes.patch(profile, userController.handleUpdateProfile);
