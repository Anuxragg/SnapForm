import { IFormField } from '@/models/FormTemplate';

export function generateZodSchema(fields: IFormField[], formName: string = 'Form'): string {
  const schemaName = `${formName.replace(/\s+/g, '')}Schema`;
  
  let fieldsCode = fields
    .map((field) => {
      let fieldValidation = '';
      
      switch (field.type) {
        case 'email':
          if (field.required) {
            fieldValidation = `z.string().email('Invalid email address').min(1, 'Email is required')`;
          } else {
            fieldValidation = `z.union([z.string().email('Invalid email address'), z.literal('')]).optional()`;
          }
          break;
          
        case 'textarea':
        case 'text': {
          fieldValidation = `z.string()`;

          // Apply min length: use validation.minLength if set, otherwise 1 for required fields
          if (field.required) {
            const minLen = field.validation?.minLength ?? 1;
            const minMsg = minLen > 1
              ? `'${field.label} must be at least ${minLen} characters'`
              : `'${field.label} is required'`;
            fieldValidation += `.min(${minLen}, ${minMsg})`;
          } else if (field.validation?.minLength) {
            // Optional but has a min: enforce when value is provided
            fieldValidation += `.min(${field.validation.minLength}, 'Minimum length is ${field.validation.minLength}')`;
          }

          // Max length
          if (field.validation?.maxLength) {
            fieldValidation += `.max(${field.validation.maxLength}, 'Maximum length is ${field.validation.maxLength}')`;
          }

          // Regex pattern
          if (field.validation?.pattern) {
            const safePattern = field.validation.pattern.replace(/\\/g, '\\\\');
            fieldValidation += `.regex(/${safePattern}/, 'Invalid format')`;
          }

          // Optional: allow empty string or undefined
          if (!field.required) {
            fieldValidation += `.optional().or(z.literal(''))`;
          }
          break;
        }
          
        case 'select':
        case 'radio':
          if (field.options && field.options.length > 0) {
            const formattedOptions = field.options.map(opt => `'${opt.replace(/'/g, "\\'")}'`).join(', ');
            if (field.required) {
              fieldValidation = `z.enum([${formattedOptions}], { required_error: 'Please select an option' })`;
            } else {
              fieldValidation = `z.enum([${formattedOptions}]).optional()`;
            }
          } else {
            fieldValidation = field.required
              ? `z.string().min(1, 'Please select an option')`
              : `z.string().optional()`;
          }
          break;
          
        case 'checkbox':
          if (field.options && field.options.length > 0) {
            // Multi-checkbox: array of selected values
            fieldValidation = `z.array(z.string())`;
            if (field.required) {
              fieldValidation += `.min(1, 'Select at least one option')`;
            } else {
              fieldValidation += `.optional()`;
            }
          } else {
            // Single boolean checkbox
            if (field.required) {
              fieldValidation = `z.boolean().refine(val => val === true, 'You must accept this field')`;
            } else {
              fieldValidation = `z.boolean().default(false)`;
            }
          }
          break;
          
        case 'file':
          if (field.required) {
            fieldValidation = `z.any().refine((files) => {
    return files instanceof FileList && files.length > 0;
  }, '${field.label} is required')`;
          } else {
            fieldValidation = `z.any().optional()`;
          }
          break;
          
        default:
          fieldValidation = `z.string()`;
      }
      
      return `  ${field.id}: ${fieldValidation},`;
    })
    .join('\n');

  return `import { z } from 'zod';

export const ${schemaName} = z.object({
${fieldsCode}
});

export type ${formName.replace(/\s+/g, '')}Input = z.infer<typeof ${schemaName}>;
`;
}
