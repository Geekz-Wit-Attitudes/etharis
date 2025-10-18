import { validateRequestJson } from "@/common";
import {
  dealService,
  UploadBriefSchema,
  type UploadBriefRequest,
} from "@/modules/deal";

import type { Handler } from "hono";

export class DealController {
  // Generate upload brief
  public handleUploadBrief: Handler = validateRequestJson(
    UploadBriefSchema,
    async (c, data: UploadBriefRequest) => {
      const user = c.get("user");

      const result = await dealService.uploadBrief(user.id, data.content_type);
      return c.json({ data: result });
    }
  );

  // Get secure brief
  public handleSecureBrief: Handler = async (c) => {
    const briefId = c.req.param("id");
    const user = c.get("user");

    const result = await dealService.getSecureDownloadUrl(briefId, user.id);
    return c.json({ data: result });
  };
}

export const dealController = new DealController();
