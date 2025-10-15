import {
  tokenType,
  type LoginRequest,
  type RegisterRequest,
} from "./auth-types";
import { prismaClient } from "../../common/config/database";
import { env } from "../../common/config/env";
import { hashPassword, verifyPassword } from "../../common/utils/password";
import { HTTPException } from "hono/http-exception";
import {
  generateToken,
  getTTL,
  verifyToken,
  type JwtPayload,
} from "../../common/utils/token";
import { renderTemplate, sendMail } from "../../common/utils/smtp";
import type { PrismaClient, TokenType } from "../../../generated/prisma";
export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;

  constructor(prisma: PrismaClient, jwtSecret: string) {
    this.prisma = prisma;
    this.jwtSecret = jwtSecret;
  }

  async register(
    request: RegisterRequest
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password, name } = request;

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log("existing", existing);

    if (existing) {
      throw new HTTPException(400, {
        message: "Failed to register, email might be already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: { email: email, name: name, password: hashedPassword },
    });

    const accessToken = await this.createToken(
      user.id,
      user.email,
      tokenType.access
    );
    const refreshToken = await this.createToken(
      user.id,
      user.email,
      tokenType.refresh
    );

    return { accessToken, refreshToken };
  }

  async login(
    request: LoginRequest
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = request;

    console.log("search", email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    console.log("user", user);

    if (!user) {
      throw new HTTPException(400, {
        message: "Unauthorized request, email or password is wrong",
      });
    }

    const valid = await verifyPassword(user.password, password);
    if (!valid) {
      throw new HTTPException(400, {
        message: "Unauthorized request, email or password is wrong",
      });
    }

    console.log("valid", valid);

    const accessToken = await this.createToken(
      user.id,
      email,
      tokenType.access
    );
    const refreshToken = await this.createToken(
      user.id,
      email,
      tokenType.refresh
    );

    return { accessToken, refreshToken };
  }

  // Change password
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const valid = await verifyPassword(oldPassword, user.password!);
    if (!valid) {
      throw new HTTPException(400, { message: "Old password is incorrect" });
    }

    const hashed = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return "Password changed successfully";
  }

  // Refresh JWT Token
  async refreshToken(
    userId: string,
    email: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenRecord = await this.prisma.token.findUnique({
      where: { id: userId },
    });
    if (
      !tokenRecord ||
      tokenRecord.type !== tokenType.refresh ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new HTTPException(401, {
        message: "Invalid or expired refresh token",
      });
    }

    const accessToken = await this.createToken(
      tokenRecord.userId,
      email,
      tokenType.access
    );
    const newRefreshToken = await this.createToken(
      tokenRecord.userId,
      email,
      tokenType.refresh
    );

    // Delete old refresh token
    await this.prisma.token.delete({ where: { id: tokenRecord.id } });

    return { accessToken, refreshToken: newRefreshToken };
  }

  // Forgot password: send reset token/email
  async forgotPassword(email: string): Promise<string> {
    if (!email) {
      throw new HTTPException(400, { message: "Email is required" });
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HTTPException(404, {
        message: "Failed to send email, make sure email is correct",
      });
    }

    const resetToken = await this.createToken(
      user.id,
      user.email,
      tokenType.passwordReset
    );

    console.log("resetToken", resetToken);

    const resetUrl = `${env.frontEndUrl}/reset-password?token=${resetToken}`;

    const html = renderTemplate("reset-password", {
      NAME: user.name || "User",
      URL: resetUrl,
    });

    await sendMail(user.email, "Password Reset - Etharis", html);

    return "Password reset link sent to email";
  }

  // Reset password using token
  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const payload = (await verifyToken(token, this.jwtSecret)) as {
        id: string;
      };
      const hashed = await hashPassword(newPassword);

      await this.prisma.user.update({
        where: { id: payload.id },
        data: { password: hashed },
      });

      return "Password reset successfully";
    } catch {
      throw new HTTPException(401, {
        message: "Invalid or expired reset token",
      });
    }
  }

  // Verify email
  async verifyEmail(userId: string): Promise<string> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { email_verified: true },
    });

    return "Email verified successfully";
  }

  // Logout
  async logout(refreshToken: string): Promise<string> {
    await this.prisma.token.deleteMany({
      where: { token: refreshToken, type: tokenType.refresh },
    });

    return "Logged out successfully";
  }

  private async createToken(
    userId: string,
    email: string,
    type: TokenType
  ): Promise<string> {
    const ttlSeconds = getTTL(type);

    const payload: Omit<JwtPayload, "iat" | "exp"> = {
      id: userId,
      email: email,
      ttlSeconds: ttlSeconds,
    };

    console.log("payload", payload);
    console.log("jwtSecret", this.jwtSecret);

    const token = await generateToken(payload, this.jwtSecret);

    console.log("token", token);

    if (type !== tokenType.access) {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      await this.prisma.token.create({
        data: {
          token,
          type,
          expiresAt,
          user: { connect: { id: userId } },
        },
      });
    }

    return token;
  }
}

export const authService = new AuthService(prismaClient, env.jwtSecret);
