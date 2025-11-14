import { auditController } from "./audit-controller";
import { authMiddleware, endpoints, type GlobalTypes } from "@/common";

import { Hono } from "hono";

export const auditRoutes = new Hono<{ Variables: GlobalTypes }>();

const { getLogsByRecord, getLogsByUser, getLogsByAction, searchLogs } =
  endpoints.audit;

/**
 * ----------------------------------------
 * Middleware
 * ----------------------------------------
 */
auditRoutes.use("*", authMiddleware);

/**
 * ----------------------------------------
 * Mount audit controller
 * ----------------------------------------
 */
auditRoutes.get(getLogsByRecord, auditController.handleGetLogsByRecord);
auditRoutes.get(getLogsByUser, auditController.handleGetLogsByUser);
auditRoutes.get(getLogsByAction, auditController.handleGetLogsByAction);
auditRoutes.get(searchLogs, auditController.handleSearchLogs);
