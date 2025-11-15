import {
  toUserResponse,
  toWalletResponse,
  type UpdateUserRequest,
  type UserResponse,
  type WalletResponse,
} from "@/modules/user";
import { AuditService, type AuditChange } from "@/modules/audit";
import {
  service,
  prismaClient,
  hashPassword,
  convertWadToRupiah,
  contractModel,
  AppError,
} from "@/common";

import {
  type PrismaClient,
  type User,
  AuditAction,
} from "../../../generated/prisma";

import { identity, pickBy } from "lodash";
import { HTTPException } from "hono/http-exception";

export class UserService {
  private prisma;
  private audit;

  constructor(prisma: PrismaClient, audit: AuditService) {
    this.prisma = prisma;
    this.audit = audit;
  }

  @service
  async getProfile(userId: string): Promise<UserResponse> {
    // Fetch user from DB
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) throw new HTTPException(404, { message: "User not found" });

    let walletWithBalance: WalletResponse | undefined;

    if (user.wallet?.address) {
      try {
        // Fetch IDRX balance from contract
        const balance = await contractModel.getBalance(user.wallet.address);

        walletWithBalance = toWalletResponse({
          ...user.wallet,
          balance: convertWadToRupiah(balance),
        });
      } catch (error) {
        throw new AppError("Failed to fetch IDRX balance:", 500, error);
      }
    }

    return toUserResponse({
      ...user,
      wallet: walletWithBalance,
    });
  }

  @service
  async updateProfile(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UserResponse> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const updateData: Partial<User> = {
      ...data,
      ...(data.password ? { password: await hashPassword(data.password) } : {}),
    };

    // Remove undefined or null values
    const filteredData = pickBy(updateData, identity);

    // Check if there are any valid fields
    if (Object.keys(filteredData).length === 0) {
      throw new HTTPException(400, { message: "No valid fields to update" });
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: filteredData,
    });

    const delta: AuditChange = { before: {}, after: {} };

    for (const key of Object.keys(filteredData)) {
      const before = currentUser[key as keyof User];
      const after = updatedUser[key as keyof User];

      if (before !== after) {
        delta.before![key] = before;
        delta.after![key] = after;
      }
    }

    if (!Object.keys(delta.before!).length) {
      return toUserResponse(updatedUser);
    }

    await this.audit.logAction(AuditAction.PROFILE, "user", userId, delta);

    return toUserResponse(updatedUser);
  }
}

// Dependencies injection
const auditService = new AuditService();

export const userService = new UserService(prismaClient, auditService);
