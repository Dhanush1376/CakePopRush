import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IAdminInvite extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  roleAssigned: 'owner' | 'super_admin' | 'main_admin' | 'admin' | 'editor' | 'viewer' | 'delivery_agent' | 'DELIVERY_AGENT';
  permissionsSummary: string;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  tokenHash: string;
  invitedBy: mongoose.Types.ObjectId;
  invitedUser?: mongoose.Types.ObjectId;
  acceptedBy?: mongoose.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminInviteSchema = new Schema<IAdminInvite>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    roleAssigned: {
      type: String,
      required: true,
      enum: ['owner', 'super_admin', 'main_admin', 'admin', 'editor', 'viewer', 'delivery_agent', 'DELIVERY_AGENT'],
    },
    permissionsSummary: { type: String, default: 'Access Admin Portal & Dashboard' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'revoked'],
      default: 'pending',
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
      default: () => crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex'),
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

AdminInviteSchema.index({ email: 1, status: 1 });

export const AdminInvite = mongoose.model<IAdminInvite>('AdminInvite', AdminInviteSchema);
export default AdminInvite;
