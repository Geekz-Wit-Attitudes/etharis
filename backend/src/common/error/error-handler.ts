import { handleZodError } from "../validation";
import { AppError, ContractError } from "./base-error";

import { Prisma } from "../../../generated/prisma";

import { ZodError } from "zod";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from "viem";

export async function errorHandler(err: Error, c: Context) {
  console.log("Error:", err);

  if (err instanceof AppError) {
    return c.json(
      {
        message: err.message,
        ...(err.details &&
          Object.keys(err.details).length > 0 && { details: err.details }),
      },
      err.statusCode as ContentfulStatusCode
    );
  }

  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status);
  }

  if (err instanceof SyntaxError) {
    return c.json({ message: "Invalid JSON request body" }, 400);
  }

  if (err instanceof ZodError) {
    return handleZodError(err as ZodError, c);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (err.code) {
      case "P2002": // Unique constraint
        return c.json({ message: "Duplicate record: already exists." }, 409);
      case "P2025": // Record not found
        return c.json({ message: "Record not found." }, 404);
      default:
        return c.json({ message: "Database error", code: err.code }, 400);
    }
  }

  return c.json(
    { message: "Internal Server Error", code: "INTERNAL_ERROR" },
    500
  );
}

export async function catchOrThrow<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    console.log("Error:", err);
    if (err instanceof AppError) {
      throw err;
    }

    if (
      err instanceof ContractFunctionExecutionError ||
      err instanceof ContractFunctionRevertedError
    ) {
      throw new ContractError(err);
    }

    throw new AppError(
      err?.message || "An unexpected error occurred",
      500,
      err
    );
  }
}
