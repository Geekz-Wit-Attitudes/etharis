import {
  tokenType,
  toTokenResponse,
  type ChangePasswordRequest,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type ResetPasswordRequest,
  type TokenResponse,
} from "@/modules/auth";

import { toUserResponse } from "@/modules/user";

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

    // Send verification email
    await this.sendEmailVerification(user.id, user.name || "User", user.email);

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
    const tokenResponse = await this.generateTokens(user.id);

    return tokenResponse;
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
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

    const userResponse = toUserResponse(user);
    const tokenResponse = await this.generateTokens(user.id);

    return {
      user: userResponse,
      token: tokenResponse,
    };
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

    // Hash new password
    const hashed = await hashPassword(new_password);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return "Password changed successfully";
  }

  // Refresh JWT Token
  async refreshToken(token: string): Promise<TokenResponse> {
    // Find token in DB
    const storedToken = await this.prisma.token.findUnique({
      where: { token: token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new HTTPException(401, {
        message: "Invalid or expired refresh token",
      });
    }

    // Validate token type
    if (storedToken.type !== tokenType.refresh) {
      throw new HTTPException(400, {
        message: "Token type mismatch, invalid password reset token",
      });
    }

    // Verify the token signature
    const payload = await verifyToken(token, this.jwtSecret);
    if (!payload || payload.sub !== storedToken.user.id) {
      throw new HTTPException(400, { message: "Invalid or tampered token" });
    }

    // Delete old refresh token
    await this.prisma.token.deleteMany({ where: { token } });

    const tokenResponse = await this.generateTokens(storedToken.user_id);

    return tokenResponse;
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
    // Find token in DB
    const storedToken = await this.prisma.token.findUnique({
      where: { token: request.token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new HTTPException(400, { message: "Invalid or expired token" });
    }

    // Validate token type
    if (storedToken.type !== tokenType.passwordReset) {
      throw new HTTPException(400, {
        message: "Token type mismatch, invalid password reset token",
      });
    }

    // Verify the token signature
    const payload = await verifyToken(request.token, this.jwtSecret);
    if (!payload || payload.sub !== storedToken.user.id) {
      throw new HTTPException(400, { message: "Invalid or tampered token" });
    }

    // Check if the user exist or not
    if (!storedToken.user) {
      throw new HTTPException(404, {
        message: "Token for reset password is invalid, User not found",
      });
    }

    const isUsingSamePassword = await verifyPassword(
      storedToken.user.password,
      request.new_password
    );
    if (isUsingSamePassword) {
      throw new HTTPException(400, {
        message: "New password cannot be the same as the old one",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(request.new_password);

    // Perform update & cleanup
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      }),
      this.prisma.token.deleteMany({ where: { token: request.token } }), // Invalidate token
    ]);

    return "Password reset successfully";
  }

  // Verify email
  async verifyEmail(token: string): Promise<string> {
    // Find token in DB
    const storedToken = await this.prisma.token.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw new HTTPException(400, { message: "Invalid or expired token" });
    }

    if (!storedToken.user) {
      throw new HTTPException(404, {
        message: "Token for email verification is invalid, user not found",
      });
    }

    if (storedToken.type !== tokenType.emailVerification) {
      throw new HTTPException(400, {
        message: "Token type mismatch, invalid email verification token",
      });
    }

    // Verify the token signature & extract payload
    const payload = await verifyToken(token, this.jwtSecret);
    if (!payload || payload.sub !== storedToken.user.id) {
      throw new HTTPException(400, { message: "Invalid or tampered token" });
    }

    if (storedToken.user.email_verified) {
      // Optional: still delete token to clean up
      await this.prisma.token.deleteMany({ where: { token } });
      return "Email is already verified";
    }

    // Update user email verified status
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: payload.sub },
        data: { email_verified: true },
      }),
      this.prisma.token.deleteMany({ where: { token } }), // Invalidate token
    ]);

    return "Email verification successfully";
  }

  // Resend verification email
  async resendEmailVerification(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Check if the user exist or not
    if (!user) {
      throw new HTTPException(404, {
        message: "Token for email verification is invalid, user not found.",
      });
    }

    // Check if the user is already verified
    if (user.email_verified) {
      return "Email is already verified.";
    }

    await this.sendEmailVerification(user.id, user.name || "User", user.email);

    return "Verification email sent successfully";
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

  // Send verification email
  private async sendEmailVerification(
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<void> {
    // Optional: delete previous email verification tokens for this user
    await this.prisma.token.deleteMany({
      where: {
        user_id: userId,
        type: tokenType.emailVerification,
      },
    });

    // Generate new email verification token
    const emailVerificationToken = await this.createToken(
      userId,
      tokenType.emailVerification
    );

    const emailVerificationUrl = `${env.frontEndUrl}/email-verification?token=${emailVerificationToken}`;

    // Render template
    const html = renderTemplate("verify-email", {
      NAME: userName || "User",
      URL: emailVerificationUrl,
    });

    // Send email
    await sendMail(userEmail, "Verify Email", html);
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
