import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailOtp extends Document {
  email: string;
  code: string;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const EmailOtpSchema = new Schema<IEmailOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL Index: documents automatically deleted after expiry
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

const EmailOtp: Model<IEmailOtp> =
  mongoose.models.EmailOtp || mongoose.model<IEmailOtp>('EmailOtp', EmailOtpSchema);

export default EmailOtp;
