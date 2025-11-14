import {
  catchOrThrow,
  computeDelta,
  prismaClient,
  getAuditContext,
} from "@/common";

import { PrismaClient, Prisma } from "../../../generated/prisma";

export type AuditAction =
  | "REGISTER"
  | "CHANGE_PASSWORD"
  | "RESET_PASSWORD"
  | "EMAIL_VERIFY"
  | "PROFILE"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ACCEPT"
  | "APPROVE"
  | "FUND"
  | "SUBMIT"
  | "DISPUTE"
  | "RESOLVE"
  | "CANCEL"
  | "RELEASE"
  | "REFUND"
  | "AUTO_RELEASE"
  | "AUTO_REFUND"
  | "EMERGENCY_CANCEL"
  | "BRIEF";

export interface AuditChange {
  before?: Record<string, any>;
  after?: Record<string, any>;
}

export interface AuditLogData {
  tableName: string;
  recordId: string;
  action: AuditAction;
  userId?: string;
  changes?: AuditChange;
  metadata?: Record<string, any>;
}

export class AuditService {
  async logAction(
    tableName: string,
    recordId: string,
    action: AuditAction,
    changes?: AuditChange,
    tx: PrismaClient | Prisma.TransactionClient = prismaClient
  ) {
    return catchOrThrow(async () => {
      const context = getAuditContext();
      const delta = computeDelta(changes?.before, changes?.after);

      return tx.auditLog.create({
        data: {
          table_name: tableName,
          record_id: recordId,
          action,
          user_id: context?.userId,
          changes: delta ? (delta as any) : undefined,
          metadata: {
            ...(context?.ipAddress && { ipAddress: context.ipAddress }),
            ...(context?.userAgent && { userAgent: context.userAgent }),
          },
        },
      });
    });
  }

  async log(data: AuditLogData) {
    return catchOrThrow(async () => {
      const delta = computeDelta(data.changes?.before, data.changes?.after);
      return prismaClient.auditLog.create({
        data: {
          table_name: data.tableName,
          record_id: data.recordId,
          action: data.action,
          user_id: data.userId,
          changes: delta ? (delta as any) : undefined,
          metadata: data.metadata as any,
        },
      });
    });
  }

  /**
   * Get audit logs for a specific record
   */
  async getLogsByRecord(tableName: string, recordId: string) {
    return catchOrThrow(() =>
      prismaClient.auditLog.findMany({
        where: { table_name: tableName, record_id: recordId },
        orderBy: { created_at: "desc" },
      })
    );
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId: string, limit = 100) {
    return catchOrThrow(() =>
      prismaClient.auditLog.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: limit,
      })
    );
  }

  /**
   * Get logs by action type
   */
  async getLogsByAction(action: AuditAction, limit = 100) {
    return catchOrThrow(() =>
      prismaClient.auditLog.findMany({
        where: { action },
        orderBy: { created_at: "desc" },
        take: limit,
      })
    );
  }

  /**
   * Search audit logs with filters
   */
  async searchLogs(filters: {
    tableName?: string;
    recordId?: string;
    userId?: string;
    action?: AuditAction;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }) {
    return catchOrThrow(async () => {
      const where: any = {};

      if (filters.tableName) where.table_name = filters.tableName;
      if (filters.recordId) where.record_id = filters.recordId;
      if (filters.userId) where.user_id = filters.userId;
      if (filters.action) where.action = filters.action;

      if (filters.dateFrom || filters.dateTo) {
        where.created_at = {};
        if (filters.dateFrom) where.created_at.gte = filters.dateFrom;
        if (filters.dateTo) where.created_at.lte = filters.dateTo;
      }

      return prismaClient.auditLog.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: filters.limit || 100,
      });
    });
  }

  /**
   * Batch log multiple entries
   */
  async logBatch(entries: AuditLogData[]) {
    return catchOrThrow(() =>
      prismaClient.auditLog.createMany({
        data: entries.map((entry) => ({
          table_name: entry.tableName,
          record_id: entry.recordId,
          action: entry.action,
          user_id: entry.userId,
          changes: entry.changes
            ? computeDelta(entry.changes.before, entry.changes.after)
            : undefined,
          metadata: entry.metadata as any,
        })),
      })
    );
  }
}

export const auditService = new AuditService();
