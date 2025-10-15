import { Hono } from "hono";
import { userService } from "./user-service";
import type { UpdateUserRequest } from "./user-types";
import type { GlobalTypes } from "../../common/types/global-types";
import { validateJson } from "../../common/validation";
import { UpdateUserSchema } from "./user-validation";

export const userController = new Hono<{ Variables: GlobalTypes }>();

userController.get("/profile", async (c) => {
  const user = c.get("user");

  const result = await userService.getProfile(user.id);

  return c.json({ data: result });
});

userController.post("/profile", validateJson(UpdateUserSchema), async (c) => {
  const user = c.get("user");

  const request = (await c.req.json()) as UpdateUserRequest;

  const result = await userService.updateProfile(user.id, request);

  return c.json({ data: result });
});
