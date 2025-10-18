import { dealController } from "./deal-controller";

import { authMiddleware, endpoints, type GlobalTypes } from "@/common";

import { Hono } from "hono";

export const dealRoutes = new Hono<{ Variables: GlobalTypes }>();

const { uploadBrief, secureDownloadBrief } = endpoints.deal;

// Apply auth middleware individually to protected routes
dealRoutes.use(authMiddleware);

dealRoutes.post(uploadBrief, dealController.handleUploadBrief);
dealRoutes.get(secureDownloadBrief, dealController.handleSecureBrief);
