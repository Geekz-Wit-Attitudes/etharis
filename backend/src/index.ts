import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

const app = new Hono();

// Versioned API grouping
const v1 = new Hono();

// Attach /api routes to main app
app.route("/api/v1", v1);

// Health check or root endpoint
app.get("/", (c) =>
  c.json({ status: "ok", version: "v1", message: "API v1 is running" })
);

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({ message: err.message });
  } else if (err instanceof ZodError) {
    c.status(400);
    return c.json({ message: err.message });
  } else {
    c.status(500);
    return c.json({ message: err.message });
  }
});

export default app;
