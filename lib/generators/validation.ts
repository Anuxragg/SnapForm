import { IFormField, IFormStyling } from '@/models/FormTemplate';

const fieldTypes = new Set(['text', 'email', 'textarea', 'select', 'radio', 'checkbox', 'file']);
const themes = new Set(['minimal', 'modern', 'neobrutalist', 'dark', 'corporate']);
const borderRadii = new Set(['sharp', 'subtle', 'rounded', 'pill']);

export function validateGeneratorInput(fields: IFormField[], styling?: IFormStyling): void {
  if (!Array.isArray(fields) || fields.length === 0 || fields.length > 100) {
    throw new Error('Fields must contain between 1 and 100 items');
  }

  const ids = new Set<string>();
  for (const [index, field] of fields.entries()) {
    if (!field || typeof field !== 'object' || typeof field.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(field.id)) {
      throw new Error(`Field ${index + 1} must have an identifier containing only letters, numbers, underscores, or hyphens`);
    }
    if (ids.has(field.id)) throw new Error(`Field identifier "${field.id}" is duplicated`);
    ids.add(field.id);
    if (typeof field.label !== 'string' || field.label.length > 500) throw new Error(`Field ${index + 1} has an invalid label`);
    if (!fieldTypes.has(field.type)) throw new Error(`Field ${index + 1} has an unsupported type`);
    if (typeof field.required !== 'boolean') throw new Error(`Field ${index + 1} has an invalid required flag`);
    if (field.placeholder !== undefined && (typeof field.placeholder !== 'string' || field.placeholder.length > 500)) {
      throw new Error(`Field ${index + 1} has an invalid placeholder`);
    }
    if (field.options !== undefined && (!Array.isArray(field.options) || field.options.length > 100 || field.options.some((option) => typeof option !== 'string' || option.length > 500))) {
      throw new Error(`Field ${index + 1} has invalid options`);
    }

    const validation = field.validation;
    if (validation !== undefined) {
      if (!validation || typeof validation !== 'object') throw new Error(`Field ${index + 1} has invalid validation rules`);
      for (const key of ['minLength', 'maxLength', 'min', 'max'] as const) {
        const value = validation[key];
        if (value !== undefined && (!Number.isFinite(value) || value < 0 || value > 1_000_000)) {
          throw new Error(`Field ${index + 1} has an invalid ${key}`);
        }
      }
      if (validation.minLength !== undefined && validation.maxLength !== undefined && validation.minLength > validation.maxLength) {
        throw new Error(`Field ${index + 1} has a minimum length greater than its maximum length`);
      }
      if (validation.pattern !== undefined) {
        if (typeof validation.pattern !== 'string' || validation.pattern.length > 500) throw new Error(`Field ${index + 1} has an invalid pattern`);
        try {
          new RegExp(validation.pattern);
        } catch {
          throw new Error(`Field ${index + 1} has an invalid regular expression`);
        }
      }
    }
  }

  if (styling !== undefined) {
    if (!styling || typeof styling !== 'object') throw new Error('Invalid form styling');
    if (!themes.has(styling.theme)) throw new Error('Unsupported form theme');
    if (styling.borderRadius !== undefined && !borderRadii.has(styling.borderRadius)) throw new Error('Unsupported border radius');
    if (typeof styling.primaryColor !== 'string' || !/^#[\da-fA-F]{3}(?:[\da-fA-F]{3})?$/.test(styling.primaryColor)) {
      throw new Error('Primary color must be a 3- or 6-digit hex color');
    }
  }
}

export function toJsString(value: string): string {
  return JSON.stringify(value);
}

export function toJsIdentifier(value: string, fallback: string): string {
  const identifier = value.replace(/[^a-zA-Z0-9_$]/g, '') || fallback;
  return /^[a-zA-Z_$]/.test(identifier) ? identifier : `Form${identifier}`;
}
