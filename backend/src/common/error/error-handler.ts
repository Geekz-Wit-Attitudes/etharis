import { handleZodError } from "../validation";
import { AppError, ContractError } from "./base-error";
import { getAuditContext } from "../utils/audit";
import { withTracing } from "../utils/tracing";

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

export async function catchOrThrow<T>(
  fn: () => Promise<T>,
  metadata: TraceMetadata = {}
): Promise<T> {
  // Extract auto span name from service + method
  const err = new Error();
  const stackLine = err.stack?.split("\n")[2] || "";
  const match = stackLine.match(/at (\w+)\.(\w+)/);
  const autoSpanName = match ? `${match[1]}.${match[2]}` : "service.operation";

  // Final span name
  const spanName = metadata.spanName ?? autoSpanName;

  // Remove spanName from metadata before passing forward
  const { spanName: _removed, ...rest } = metadata;

  // Audit context
  const audit = getAuditContext() || {};
  const { userId, ipAddress, userAgent } = audit;

  // Build tracing metadata
  const traceMeta: Record<string, any> = {
    userId,
    ipAddress,
    userAgent,
    ...rest,
  };

  if (metadata.args) {
    const sanitized = sanitizeArgs(metadata.args);

    traceMeta["args"] = sanitized;
  }

  try {
    return await withTracing(spanName, fn, traceMeta);
  } catch (error: any) {
    console.error(`[catchOrThrow] Error in ${spanName}:`, error);

    if (error instanceof AppError) throw error;
    if (error instanceof HTTPException) throw error;

    if (
      error instanceof ContractFunctionExecutionError ||
      error instanceof ContractFunctionRevertedError
    ) {
      throw new ContractError(error);
    }

    throw new AppError(
      error?.message || "An unexpected error occurred",
      error?.statusCode || 500,
      error
    );
  }
}

export interface TraceMetadata {
  spanName?: string;
  args?: Record<string, any>;
  [key: string]: any; // safely extendable
}

const SENSITIVE_KEYS = ["password", "new_password", "old_password"];

function sanitizeArgs(obj: any) {
  try {
    if (!obj || typeof obj !== "object") return obj;

    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => {
        if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
          return [key, "***hidden***"];
        }
        return [key, val];
      })
    );
  } catch {
    return {};
  }
}
