import { auditService } from "./audit-service";
import { SearchAuditSchema } from "./audit-validation";
import { validateRequestQuery } from "@/common";

import type { Handler } from "hono";

export class AuditController {
  /**
   * Get all logs for a specific record
   */
  public handleGetLogsByRecord: Handler = async (c) => {
    const tableName = c.req.param("table");
    const recordId = c.req.param("record");

    const result = await auditService.getLogsByRecord(tableName, recordId);

    return c.json({ data: result });
  };

  /**
   * Get all logs for a specific user
   */
  public handleGetLogsByUser: Handler = async (c) => {
    const userId = c.req.param("userId");

    const result = await auditService.getLogsByUser(userId);

    return c.json({ data: result });
  };

  /**
   * Get logs filtered by action
   */
  public handleGetLogsByAction: Handler = async (c) => {
    const action = c.req.param("action");

    const result = await auditService.getLogsByAction(action as any);

    return c.json({ data: result });
  };

  /**
   * Search logs with filters
   */
  public handleSearchLogs = validateRequestQuery(
    SearchAuditSchema,
    async (c, query) => {
      const result = await auditService.searchLogs({
        tableName: query.table_name,
        recordId: query.record_id,
        userId: query.user_id,
        action: query.action as any,
        dateFrom: query.date_from ? new Date(query.date_from) : undefined,
        dateTo: query.date_to ? new Date(query.date_to) : undefined,
        limit: query.limit,
      });

      return c.json({ data: result });
    }
  );
}

export const auditController = new AuditController();
