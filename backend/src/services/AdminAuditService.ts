import AdminAuditLog from '../models/AdminAuditLog';
import logger from '../config/logger';

export interface AuditLogParams {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
  entityType: string;
  entityId: string;
  action: string;
  previousValue?: any;
  newValue?: any;
}

export class AdminAuditService {
  /**
   * Logs an admin action with full entity context and change tracking.
   * Fails gracefully without disrupting normal request processing.
   */
  static async logAction(params: AuditLogParams): Promise<void> {
    try {
      let changes: Record<string, { previous: any; new: any }> | undefined;
      if (
        params.previousValue &&
        params.newValue &&
        typeof params.previousValue === 'object' &&
        typeof params.newValue === 'object'
      ) {
        changes = {};
        const allKeys = new Set([
          ...Object.keys(params.previousValue),
          ...Object.keys(params.newValue),
        ]);
        for (const key of allKeys) {
          const prev = params.previousValue[key];
          const next = params.newValue[key];
          if (JSON.stringify(prev) !== JSON.stringify(next)) {
            changes[key] = { previous: prev, new: next };
          }
        }
        if (Object.keys(changes).length === 0) {
          changes = undefined;
        }
      }

      await AdminAuditLog.create({
        actorId: params.actorId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole || 'admin',
        method: params.method || 'POST',
        path: params.path,
        statusCode: params.statusCode || 200,
        ip: params.ip,
        userAgent: params.userAgent,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        changes,
        previousValue: params.previousValue,
        newValue: params.newValue,
      });
    } catch (err: any) {
      logger.error(`[ADMIN AUDIT] Failed to log action: ${err.message}`, {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
      });
    }
  }
}

export default AdminAuditService;
