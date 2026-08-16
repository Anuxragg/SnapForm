import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormSubmission extends Document {
  formId: mongoose.Types.ObjectId;
  data: Record<string, any>;
  submittedAt: Date;
  ipHash?: string;
  userAgent?: string;
}

const FormSubmissionSchema = new Schema<IFormSubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'FormTemplate',
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipHash: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const FormSubmission: Model<IFormSubmission> =
  mongoose.models.FormSubmission ||
  mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);

export default FormSubmission;
