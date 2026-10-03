import mongoose, { Schema, Document } from 'mongoose';

export interface IUsedRefreshToken extends Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UsedRefreshTokenSchema = new Schema<IUsedRefreshToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Expire used tokens after 5 minutes (sufficient for 60s concurrent grace period)
UsedRefreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export const UsedRefreshToken = mongoose.model<IUsedRefreshToken>(
  'UsedRefreshToken',
  UsedRefreshTokenSchema
);
export default UsedRefreshToken;
