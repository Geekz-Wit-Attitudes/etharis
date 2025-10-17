import { authMiddleware, endpoints, type GlobalTypes } from "../../common";
import { authController } from "../../modules/auth";

import { Hono } from "hono";

export const authRoutes = new Hono<{ Variables: GlobalTypes }>();

/**
 * ----------------------------------------
 * Public routes
 * ----------------------------------------
 */
const { register, login, forgotPassword, resetPassword } =
  endpoints.auth.public;

authRoutes.post(register, authController.handleRegister);
authRoutes.post(login, authController.handleLogin);
authRoutes.post(forgotPassword, authController.handleForgotPassword);
authRoutes.post(resetPassword, authController.handleResetPassword);

/**
 * ----------------------------------------
 * Protected routes
 * ----------------------------------------
 */
const { changePassword, refreshToken, verifyEmail, logout } =
  endpoints.auth.protected;

// Apply auth middleware individually to protected routes
authRoutes.use(authMiddleware);

authRoutes.post(changePassword, authController.handleChangePassword);
authRoutes.post(refreshToken, authController.handleRefreshToken);
authRoutes.post(verifyEmail, authController.handleVerifyEmail);
authRoutes.post(logout, authController.handleLogout);
