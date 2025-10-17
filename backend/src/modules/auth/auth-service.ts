import {
  tokenType,
  toTokenResponse,
  type ChangePasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
  type TokenResponse,
} from "../../modules/auth";

import {
  env,
  prismaClient,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  renderTemplate,
  sendMail,
  getTimeToLive,
  createWallet,
  type JwtPayload,
  type WalletData,
} from "../../common";

import type {
  PrismaClient,
  TokenType,
  UserRole,
} from "../../../generated/prisma";

import { HTTPException } from "hono/http-exception";

export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;

  constructor(prisma: PrismaClient, jwtSecret: string) {
    this.prisma = prisma;
    this.jwtSecret = jwtSecret;
  }

  async register(request: RegisterRequest): Promise<TokenResponse> {
    const { email, password, name, role } = request;

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new HTTPException(400, {
        message: "Failed to register, email might be already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const userRole = role.toUpperCase() as UserRole;

    const user = await this.prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Generate wallet using viem
    const wallet: WalletData = await createWallet(user.id);

    // Create wallet
    await this.prisma.wallet.create({
      data: {
        user_id: user.id,
        address: wallet.address,
        secret_path: wallet.secretPath,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return tokens;
  }

  async login(request: LoginRequest): Promise<TokenResponse> {
    const { email, password } = request;

    const user = await this.prisma.user.findUnique({ where: { email } });

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

    const tokens = await this.generateTokens(user.id);

    return tokens;
  }

  // Change password
  async changePassword(
    userId: string,
    request: ChangePasswordRequest
  ): Promise<string> {
    const { old_password, new_password } = request;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const valid = await verifyPassword(user.password, old_password);
    if (!valid) {
      throw new HTTPException(400, { message: "Old password is incorrect" });
    }

    const hashed = await hashPassword(new_password);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return "Password changed successfully";
  }

  // Refresh JWT Token
  async refreshToken(userId: string): Promise<TokenResponse> {
    const tokenRecord = await this.prisma.token.findUnique({
      where: { id: userId },
    });

    // Check if refresh token is valid
    if (
      !tokenRecord ||
      tokenRecord.type !== tokenType.refresh ||
      tokenRecord.expires_at < new Date()
    ) {
      throw new HTTPException(401, {
        message: "Invalid or expired refresh token",
      });
    }

    // Create new tokens
    const tokens = await this.generateTokens(userId);

    // Delete old refresh token
    await this.prisma.token.delete({ where: { id: tokenRecord.id } });

    return tokens;
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

    const passwordResetToken = await this.createToken(
      user.id,
      tokenType.passwordReset
    );

    const resetUrl = `${env.frontEndUrl}/reset-password?token=${passwordResetToken}`;

    const html = renderTemplate("reset-password", {
      NAME: user.name || "User",
      URL: resetUrl,
    });

    await sendMail(user.email, "Password Reset", html);

    return "Password reset link sent to email";
  }

  // Reset password using token
  async resetPassword(request: ResetPasswordRequest): Promise<string> {
    const payload = (await verifyToken(request.token, this.jwtSecret)) as {
      sub: string;
    };
    const userId = payload.sub;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HTTPException(404, { message: "User not found" });

    const hashed = await hashPassword(request.new_password);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // Invalidate token in your Token table
    await this.prisma.token.deleteMany({ where: { token: request.token } });

    return "Password reset successfully";
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
    const deleted = await this.prisma.token.deleteMany({
      where: { token: refreshToken, type: tokenType.refresh },
    });

    if (deleted.count === 0) {
      throw new HTTPException(400, {
        message: "Refresh token not found or already invalidated",
      });
    }

    return "Logged out successfully";
  }

  // Generate tokens
  private async generateTokens(userId: string): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createToken(userId, tokenType.access),
      this.createToken(userId, tokenType.refresh),
    ]);
    return toTokenResponse(accessToken, refreshToken);
  }

  // Create token
  private async createToken(userId: string, type: TokenType): Promise<string> {
    const duration = getTimeToLive(type);

    const payload: Omit<JwtPayload, "iat" | "exp"> = {
      sub: userId,
      duration: duration,
    };

    const token = await generateToken(payload, this.jwtSecret);

    if (type !== tokenType.access) {
      const expiresAt = new Date(Date.now() + duration * 1000);
      await this.prisma.token.create({
        data: {
          token,
          type,
          expires_at: expiresAt,
          user: { connect: { id: userId } },
        },
      });
    }

    return token;
  }
}

export const authService = new AuthService(prismaClient, env.jwtSecret);
