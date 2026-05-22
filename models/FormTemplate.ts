import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: string[];
}

export interface IFormStyling {
  theme: 'minimal' | 'modern' | 'corporate';
  primaryColor: string;
}

export interface IFormTemplate extends Document {
  name: string;
  category: 'contact' | 'payment' | 'survey' | 'booking';
  description: string;
  fields: IFormField[];
  styling: IFormStyling;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'file'],
    required: true,
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  validation: {
    pattern: { type: String },
    minLength: { type: Number },
    maxLength: { type: Number },
    min: { type: Number },
    max: { type: Number },
  },
  options: [{ type: String }],
});

const FormStylingSchema = new Schema<IFormStyling>({
  theme: {
    type: String,
    enum: ['minimal', 'modern', 'corporate'],
    default: 'modern',
  },
  primaryColor: { type: String, default: '#6366f1' }, // Default Indigo
});

const FormTemplateSchema = new Schema<IFormTemplate>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['contact', 'payment', 'survey', 'booking'],
      required: true,
    },
    description: { type: String, required: true },
    fields: [FormFieldSchema],
    styling: { type: FormStylingSchema, required: true },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is not re-compiled during development hot reloads
const FormTemplate: Model<IFormTemplate> =
  mongoose.models.FormTemplate || mongoose.model<IFormTemplate>('FormTemplate', FormTemplateSchema);

export default FormTemplate;
