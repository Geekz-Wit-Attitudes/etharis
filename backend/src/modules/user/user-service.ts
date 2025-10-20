import {
  toUserResponse,
  type UpdateUserRequest,
  type UserResponse,
} from "@/modules/user";
import { prismaClient, hashPassword } from "@/common";

import type { PrismaClient, User } from "../../../generated/prisma";

import { identity, pickBy } from "lodash";
import { HTTPException } from "hono/http-exception";

export class UserService {
  private prisma;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) throw new HTTPException(404, { message: "User not found" });

    return toUserResponse(user);
  }

  async updateProfile(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UserResponse> {
    console.log("data", data);

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

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: filteredData,
    });

    return toUserResponse(user);
  }
}

export const userService = new UserService(prismaClient);
