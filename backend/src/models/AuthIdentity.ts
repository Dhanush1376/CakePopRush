import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthIdentity extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'email' | 'phone' | 'google';
  providerSubjectId: string;
  verifiedAt?: Date;
  metadata?: {
    displayName?: string;
    avatar?: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AuthIdentitySchema = new Schema<IAuthIdentity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['email', 'phone', 'google'], required: true },
    providerSubjectId: { type: String, required: true },
    verifiedAt: { type: Date },
    metadata: {
      displayName: { type: String },
      avatar: { type: String },
      email: { type: String },
    },
  },
  { timestamps: true }
);

// Compound unique index — sole authority on identity uniqueness
AuthIdentitySchema.index({ provider: 1, providerSubjectId: 1 }, { unique: true });
AuthIdentitySchema.index({ userId: 1, provider: 1 });

export const AuthIdentity = mongoose.model<IAuthIdentity>('AuthIdentity', AuthIdentitySchema);
export default AuthIdentity;
