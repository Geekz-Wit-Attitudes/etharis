import {
  toUserResponse,
  toWalletResponse,
  type UpdateUserRequest,
  type UserResponse,
  type WalletResponse,
} from "@/modules/user";
import {
  prismaClient,
  hashPassword,
  convertWadToRupiah,
  catchOrThrow,
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
import { AuditService } from "../audit";

export class UserService {
  private prisma;
  private audit;

  constructor(prisma: PrismaClient, audit: AuditService) {
    this.prisma = prisma;
    this.audit = audit;
  }

  async getProfile(userId: string): Promise<UserResponse> {
    return catchOrThrow(async () => {
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
    });
  }

  async updateProfile(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UserResponse> {
    return catchOrThrow(async () => {
      const updateData: Partial<User> = {
        ...data,
        ...(data.password
          ? { password: await hashPassword(data.password) }
          : {}),
      };

      // Remove undefined or null values
      const filteredData = pickBy(updateData, identity);

      // Check if there are any valid fields
      if (Object.keys(filteredData).length === 0) {
        throw new HTTPException(400, { message: "No valid fields to update" });
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: filteredData,
      });

      await this.audit.logAction("user", userId, AuditAction.PROFILE, {
        after: user,
      });

      return toUserResponse(user);
    });
  }
}

// Dependencies injection
const auditService = new AuditService();

export const userService = new UserService(prismaClient, auditService);
