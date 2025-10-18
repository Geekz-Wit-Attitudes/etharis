import { logger } from "../utils/logger";

import { PrismaClient } from "../../../generated/prisma";

export const prismaClient = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prismaClient.$on("query", (e: any) => {
  logger.info(e);
});

prismaClient.$on("error", (e: any) => {
  logger.error(e);
});

prismaClient.$on("info", (e: any) => {
  logger.info(e);
});

prismaClient.$on("warn", (e: any) => {
  logger.warn(e);
});

async function testConnection() {
  try {
    await prismaClient.$connect();
    logger.info("Prisma connected successfully");
  } catch (e) {
    logger.error("Prisma connection error:", e);
  }
}

testConnection();
