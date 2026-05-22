import { IFormField } from '@/models/FormTemplate';

export function generateZodSchema(fields: IFormField[], formName: string = 'Form'): string {
  const schemaName = `${formName.replace(/\s+/g, '')}Schema`;
  
  let fieldsCode = fields
    .map((field) => {
      let fieldValidation = '';
      
      switch (field.type) {
        case 'email':
          fieldValidation = `z.string().email('Invalid email address')`;
          if (field.required) {
            fieldValidation += `.min(1, 'Email is required')`;
          } else {
            fieldValidation = `z.union([z.string().email('Invalid email address'), z.literal('')]).optional()`;
          }
          break;
          
        case 'textarea':
        case 'text':
          fieldValidation = `z.string()`;
          
          if (field.required) {
            fieldValidation += `.min(${field.validation?.minLength || 1}, '${field.label} is required')`;
          } else {
            // For optional text, let's allow empty strings
            fieldValidation += `.optional().or(z.literal(''))`;
          }
          
          if (field.validation?.minLength && field.required) {
            // Already handled by .min(1) unless minLength is greater than 1
            if (field.validation.minLength > 1) {
              fieldValidation += `.min(${field.validation.minLength}, 'Minimum length is ${field.validation.minLength}')`;
            }
          }
          if (field.validation?.maxLength) {
            fieldValidation += `.max(${field.validation.maxLength}, 'Maximum length is ${field.validation.maxLength}')`;
          }
          if (field.validation?.pattern) {
            // Escape regex slashes for output
            const safePattern = field.validation.pattern.replace(/\\/g, '\\\\');
            fieldValidation += `.regex(/${safePattern}/, 'Invalid format')`;
          }
          break;
          
        case 'select':
        case 'radio':
          if (field.options && field.options.length > 0) {
            const formattedOptions = field.options.map(opt => `'${opt.replace(/'/g, "\\'")}'`).join(', ');
            fieldValidation = `z.enum([${formattedOptions}])`;
          } else {
            fieldValidation = `z.string()`;
          }
          
          if (field.required) {
            fieldValidation += `, { required_error: 'Please select an option' }`;
          } else {
            fieldValidation = `z.union([${fieldValidation}, z.literal('')]).optional()`;
          }
          break;
          
        case 'checkbox':
          if (field.options && field.options.length > 0) {
            // Multi-checkbox represents an array of options
            fieldValidation = `z.array(z.string())`;
            if (field.required) {
              fieldValidation += `.min(1, 'Select at least one option')`;
            } else {
              fieldValidation += `.optional()`;
            }
          } else {
            // Single checkbox (boolean)
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
