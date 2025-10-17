import { zValidator } from "@hono/zod-validator";
import type { ZodObject, ZodRawShape, ZodType } from "zod";
import { ZodError } from "zod";
import type { Context, Handler, ValidationTargets } from "hono";

/* ----------------------------------------
 * Unified Zod error handler
 * ---------------------------------------- */
export function handleZodError<T>(err: ZodError<T>, c: Context) {
  const firstIssue = err.issues?.[0]?.message ?? "Invalid input request";
  return c.json(
    {
      success: false,
      message: firstIssue,
      issues: err.issues,
    },
    400
  );
}

/* ----------------------------------------
 * Generic request validator (for controller handlers)
 * ---------------------------------------- */
export const validateRequest = <Target extends keyof ValidationTargets, T>(
  target: Target,
  schema: ZodType<T>,
  handler: (c: any, data: T) => Promise<Response>
): Handler => {
  return zValidator(target, schema, async (result, c) => {
    if (!result.success) {
      throw result.error;
    }
    return handler(c, result.data);
  });
};

/* ----------------------------------------
 * Convenience wrappers for validateRequest
 * ---------------------------------------- */
export const validateRequestJson = <T>(
  schema: ZodType<T>,
  handler: (c: any, data: T) => Promise<Response>
): Handler => validateRequest("json", schema, handler);

export const validateRequestQuery = <T>(
  schema: ZodType<T>,
  handler: (c: any, data: T) => Promise<Response>
): Handler => validateRequest("query", schema, handler);

export const validateRequestParams = <T>(
  schema: ZodType<T>,
  handler: (c: any, data: T) => Promise<Response>
): Handler => validateRequest("param", schema, handler);

export const validateRequestHeaders = <T>(
  schema: ZodType<T>,
  handler: (c: any, data: T) => Promise<Response>
): Handler => validateRequest("header", schema, handler);

/* ----------------------------------------
 * Convenience wrappers for multiple request validators
 * ---------------------------------------- */
type MultiValidationTarget = Partial<ValidationTargets>;

export const validateRequestMultiTarget = <
  T extends MultiValidationTarget,
  R extends {
    json?: ZodType<T["json"]>;
    query?: ZodType<T["query"]>;
    param?: ZodType<T["param"]>;
    header?: ZodType<T["header"]>;
  }
>(
  schemas: R,
  handler: (
    c: any,
    data: {
      json?: T["json"];
      query?: T["query"];
      param?: T["param"];
      header?: T["header"];
    }
  ) => Promise<Response>
): Handler => {
  return async (c) => {
    try {
      const result: any = {};

      if (schemas.json) {
        const parsed = schemas.json.safeParse(await c.req.json());
        if (!parsed.success) throw parsed.error;
        result.json = parsed.data;
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(c.req.query());
        if (!parsed.success) throw parsed.error;
        result.query = parsed.data;
      }

      if (schemas.param) {
        const parsed = schemas.param.safeParse(c.req.param());
        if (!parsed.success) throw parsed.error;
        result.param = parsed.data;
      }

      if (schemas.header) {
        const headers = c.req.header();
        const parsed = schemas.header.safeParse(headers);
        if (!parsed.success) throw parsed.error;
        result.header = parsed.data;
      }

      return handler(c, result);
    } catch (err) {
      if (err instanceof ZodError) {
        return handleZodError(err, c);
      }
      throw err;
    }
  };
};

/* ----------------------------------------
 * Middleware-style validators (no handler)
 * ---------------------------------------- */
const _validate = <T extends ZodRawShape>(
  target: "json" | "query" | "param" | "header",
  schema: ZodObject<T>
) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  });

export const validateJson = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("json", schema);
export const validateQuery = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("query", schema);
export const validateParams = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("param", schema);
export const validateHeaders = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("header", schema);
