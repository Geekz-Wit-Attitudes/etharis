import { AsyncLocalStorage } from "async_hooks";

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const auditStorage = new AsyncLocalStorage<AuditContext>();

export const runWithAuditContext = async <T>(
  context: AuditContext,
  callback: () => Promise<T>
): Promise<T> => {
  return auditStorage.run(context, callback);
};

export const getAuditContext = (): AuditContext => {
  return auditStorage.getStore() ?? {};
};
