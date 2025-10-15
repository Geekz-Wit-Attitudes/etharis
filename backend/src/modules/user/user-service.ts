import type { PrismaClient } from "@prisma/client";
import {
  toUserResponse,
  type UpdateUserRequest,
  type UserResponse,
} from "./user-types";
import { prismaClient } from "../../common/config/database";
import { env } from "../../common/config/env";
import { hashPassword } from "../../common/utils/password";
import { identity, pickBy } from "lodash";

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error("User not found");

    return toUserResponse(user);
  }

  async updateProfile(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UserResponse> {
    const updateData = {
      ...data,
      ...(data.password ? { password: await hashPassword(data.password) } : {}),
    };

    // Remove undefined or null values
    const filteredData = pickBy(updateData, identity);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: filteredData,
    });

    return toUserResponse(user);
  }
}

export const userService = new UserService(prismaClient);
