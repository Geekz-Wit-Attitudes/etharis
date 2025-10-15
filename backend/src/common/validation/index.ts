import { zValidator } from "@hono/zod-validator";
import type { ZodObject, ZodRawShape } from "zod";

// Internal generic function
const _validate = <T extends ZodRawShape>(
  target: "json" | "query" | "param" | "header",
  schema: ZodObject<T>
) => zValidator(target, schema);

// Exported named functions
export const validateJson = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("json", schema);
export const validateQuery = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("query", schema);
export const validateParams = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("param", schema);
export const validateHeaders = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  _validate("header", schema);
