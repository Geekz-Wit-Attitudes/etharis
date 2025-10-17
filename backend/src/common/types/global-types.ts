import type { User, PrismaClient } from "../../../generated/prisma";

export type GlobalTypes = {
  prismaClient: PrismaClient;
  jwtSecret: string;
  user: User;
};
