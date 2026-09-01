import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  provider?: 'credentials' | 'google' | 'github' | string;
  providerId?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: false, default: '' },
    salt: { type: String, required: false, default: '' },
    provider: { type: String, default: 'credentials' },
    providerId: { type: String, required: false, default: '' },
    avatar: { type: String, required: false, default: '' },
    isVerified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Ensure the model uses the updated schema even if previously cached in dev
if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
