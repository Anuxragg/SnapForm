import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormView extends Document {
  formId: mongoose.Types.ObjectId;
  visitorHash: string;
  viewedAt: Date;
}

const FormViewSchema = new Schema<IFormView>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'FormTemplate',
      required: true,
      index: true,
    },
    visitorHash: {
      type: String,
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: guarantees 1 view per visitor per form for life
FormViewSchema.index({ formId: 1, visitorHash: 1 }, { unique: true });

const FormView: Model<IFormView> =
  mongoose.models.FormView || mongoose.model<IFormView>('FormView', FormViewSchema);

export default FormView;
