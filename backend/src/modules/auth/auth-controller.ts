import {
  authService,
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  type ChangePasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
} from "@/modules/auth";
import { validateRequestJson } from "@/common/validation";

import type { Handler } from "hono";
import { HTTPException } from "hono/http-exception";

export class AuthController {
  // Register
  public handleRegister: Handler = validateRequestJson(
    RegisterSchema,
    async (c, data: RegisterRequest) => {
      const response = await authService.register(data);

      return c.json({ data: response });
    }
  );

  // Login
  public handleLogin: Handler = validateRequestJson(
    LoginSchema,
    async (c, data: LoginRequest) => {
      const response = await authService.login(data);
      return c.json({ data: response });
    }
  );

  // Forgot password (simple custom handler)
  public handleForgotPassword: Handler = async (c) => {
    const { email } = await c.req.json();

    if (!email) {
      throw new HTTPException(400, {
        message: "Email is required, please fill the email field",
      });
    }

    const response = await authService.forgotPassword(email);

    return c.json({ message: response });
  };

  // Reset password
  public handleResetPassword: Handler = validateRequestJson(
    ResetPasswordSchema,
    async (c, data: ResetPasswordRequest) => {
      const response = await authService.resetPassword(data);

      return c.json({ message: response });
    }
  );

  // Change password
  public handleChangePassword: Handler = validateRequestJson(
    ChangePasswordSchema,
    async (c, data: ChangePasswordRequest) => {
      const user = c.get("user");

      const response = await authService.changePassword(user.id, data);

      return c.json({ message: response });
    }
  );

  // Refresh token
  public handleRefreshToken: Handler = async (c) => {
    const { refresh_token: refreshToken } = await c.req.json();

    if (!refreshToken) {
      throw new HTTPException(400, {
        message:
          "Refresh token is required, please fill the refresh_token field",
      });
    }

    const response = await authService.refreshToken(refreshToken);

    return c.json({ data: response });
  };

  // Verify email
  public handleVerifyEmail: Handler = async (c) => {
    const { token } = await c.req.json();

    if (!token) {
      throw new HTTPException(400, {
        message: "Token is required, please fill the token field",
      });
    }

    const response = await authService.verifyEmail(token);

    return c.json({ message: response });
  };

  // Resend Email Verification
  public handleResendVerificationEmail: Handler = async (c) => {
    const user = c.get("user");

    const response = await authService.resendEmailVerification(user.email);

    return c.json({ message: response });
  };

  // Logout
  public handleLogout: Handler = async (c) => {
    const { refresh_token } = await c.req.json();

    if (!refresh_token) {
      throw new HTTPException(400, { message: "Refresh token is required" });
    }

    const response = await authService.logout(refresh_token);
    return c.json({ message: response });
  };
}

export const authController = new AuthController();
