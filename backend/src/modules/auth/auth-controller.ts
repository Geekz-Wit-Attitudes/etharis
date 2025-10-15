import { Hono } from "hono";
import { LoginSchema, RegisterSchema } from "./auth-validation";
import { authService } from "./auth-service";
import type { LoginRequest, RegisterRequest } from "./auth-types";
import { validateJson } from "../../common/validation";
import type { GlobalTypes } from "../../common/types/global-types";
import type { HTTPException } from "hono/http-exception";

export class AuthController {
  public readonly publicRoutes: Hono<{ Variables: GlobalTypes }>;
  public readonly protectedRoutes: Hono<{ Variables: GlobalTypes }>;

  constructor() {
    this.publicRoutes = new Hono<{ Variables: GlobalTypes }>();
    this.protectedRoutes = new Hono<{ Variables: GlobalTypes }>();

    this.initializePublicRoutes();
    this.initializeProtectedRoutes();
  }

  // PUBLIC ROUTES (No Authentication)
  private initializePublicRoutes() {
    this.publicRoutes.post(
      "/register",
      validateJson(RegisterSchema),
      async (c) => {
        try {
          const data = c.req.valid("json") as RegisterRequest;
          const token = await authService.register(data);
          return c.json({ data: { token } });
        } catch (err) {
          return c.json({ message: (err as HTTPException).message }, 500);
        }
      }
    );

    this.publicRoutes.post("/login", validateJson(LoginSchema), async (c) => {
      try {
        const data = c.req.valid("json") as LoginRequest;
        console.log("data", data);
        const result = await authService.login(data);
        console.log("result", result);
        return c.json(result);
      } catch (err) {
        console.error("Login error:", err);
        return c.json({ message: (err as Error).message }, 500);
      }
    });

    this.publicRoutes.post("/forgot-password", async (c) => {
      const { email } = await c.req.json();
      const result = await authService.forgotPassword(email);
      return c.json({ message: result });
    });

    this.publicRoutes.post("/reset-password", async (c) => {
      try {
        const { token, newPassword } = await c.req.json();
        const result = await authService.resetPassword(token, newPassword);
        return c.json({ message: result });
      } catch (err) {
        return c.json({ message: (err as Error).message }, 500);
      }
    });
  }

  // PROTECTED ROUTES (Authentication Required)
  private initializeProtectedRoutes() {
    this.protectedRoutes.post("/change-password", async (c) => {
      const user = c.get("user");
      const { oldPassword, newPassword } = await c.req.json();
      const result = await authService.changePassword(
        user.id,
        oldPassword,
        newPassword
      );
      return c.json({ message: result });
    });

    this.protectedRoutes.post("/refresh-token", async (c) => {
      const user = c.get("user");
      const token = await authService.refreshToken(user.id, user.email);
      return c.json({ data: { token } });
    });

    this.protectedRoutes.post("/verify-email", async (c) => {
      const user = c.get("user");
      const result = await authService.verifyEmail(user.id);
      return c.json({ message: result });
    });

    this.protectedRoutes.post("/logout", async (c) => {
      const token = c.req.header("Authorization")?.replace("Bearer ", "");
      const result = await authService.logout(token!);
      return c.json({ message: result });
    });
  }
}

// Export singleton instance
export const authController = new AuthController();
