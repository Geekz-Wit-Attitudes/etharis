import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { Context } from "hono";

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json({ message: "Validation failed", issues: err.issues }, 400);
  }
  return c.json({ message: "Internal Server Error" }, 500);
}
