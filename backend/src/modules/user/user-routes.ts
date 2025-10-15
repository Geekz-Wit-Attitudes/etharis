import { Hono } from "hono";
import { userController } from "./user-controller";
import { authMiddleware } from "../../common/middleware/auth-middleware";

export const userRoutes = new Hono();

// Apply auth middleware
userRoutes.use("*", authMiddleware);

// Mount user controller
userRoutes.route("/", userController);
