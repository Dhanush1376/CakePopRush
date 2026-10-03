import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminAuditLog extends Document {
  actorId?: string;
  actorEmail?: string;
  actorRole: string;
  method?: string;
  path?: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, { previous: any; new: any }>;
  previousValue?: any;
  newValue?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    actorId: { type: String, index: true },
    actorEmail: { type: String, index: true },
    actorRole: { type: String, default: 'admin' },
    method: { type: String },
    path: { type: String },
    statusCode: { type: Number, default: 200 },
    ip: { type: String },
    userAgent: { type: String },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    changes: { type: Schema.Types.Mixed },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);
export default AdminAuditLog;
