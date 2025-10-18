import { userService } from "./user-service";
import { UpdateUserSchema } from "./user-validation";
import { validateRequestJson } from "@/common";

import type { Handler } from "hono";

export class UserController {
  public handleGetProfile: Handler = async (c) => {
    const user = c.get("user");

    const result = await userService.getProfile(user.id);

    return c.json({ data: result });
  };

  public handleUpdateProfile = validateRequestJson(
    UpdateUserSchema,
    async (c, data) => {
      const user = c.get("user");

      const result = await userService.updateProfile(user.id, data);

      return c.json({ data: result });
    }
  );
}

export const userController = new UserController();
