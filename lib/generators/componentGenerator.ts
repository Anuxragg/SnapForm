import { IFormField, IFormStyling } from '@/models/FormTemplate';
import { toJsIdentifier, toJsString, validateGeneratorInput } from '@/lib/generators/validation';

export function generateReactComponent(
  fields: IFormField[],
  styling: IFormStyling,
  formName: string = 'Form',
  description?: string,
  category?: string
): string {
  validateGeneratorInput(fields, styling);
  if (typeof formName !== 'string' || formName.length > 200) throw new Error('Form name must be a string of at most 200 characters');
  if (description !== undefined && (typeof description !== 'string' || description.length > 2000)) throw new Error('Description must be a string of at most 2000 characters');
  const componentName = toJsIdentifier(formName, 'CustomForm');
  const schemaName = `${componentName}Schema`;
  const inputName = `${componentName}Input`;
  
  // Theme-specific CSS classes
  const isDark = styling.theme === 'dark';
  let radiusClass = 'rounded-2xl';
  let inputRadiusClass = 'rounded-xl';
  let buttonRadiusClass = 'rounded-xl';

  switch (styling.borderRadius) {
    case 'sharp':
      radiusClass = 'rounded-none';
      inputRadiusClass = 'rounded-none';
      buttonRadiusClass = 'rounded-none';
      break;
    case 'subtle':
      radiusClass = 'rounded-xl';
      inputRadiusClass = 'rounded-lg';
      buttonRadiusClass = 'rounded-lg';
      break;
    case 'pill':
      radiusClass = 'rounded-3xl';
      inputRadiusClass = 'rounded-2xl';
      buttonRadiusClass = 'rounded-full';
      break;
    case 'rounded':
    default:
      radiusClass = 'rounded-2xl';
      inputRadiusClass = 'rounded-xl';
      buttonRadiusClass = 'rounded-xl';
      break;
  }

  let cardClass = '';
  switch (styling.theme) {
    case 'neobrutalist':
      cardClass = `border-2 border-black bg-white ${radiusClass} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 max-w-lg mx-auto`;
      break;
    case 'dark':
      cardClass = `border border-neutral-800 bg-[#131722] text-white ${radiusClass} shadow-2xl p-8 max-w-lg mx-auto`;
      break;
    case 'minimal':
      cardClass = `border-2 border-neutral-900 bg-white ${radiusClass} shadow-none p-8 max-w-lg mx-auto`;
      break;
    case 'modern':
    default:
      cardClass = `backdrop-blur-3xl bg-white/45 border border-white/85 ${radiusClass} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,1)] p-8 max-w-lg mx-auto`;
      break;
  }

  let inputClass = `${inputRadiusClass} transition-all `;
  if (isDark) {
    inputClass += 'bg-[#181f2c] border border-neutral-700 text-white';
  } else if (styling.theme === 'minimal') {
    inputClass += 'bg-neutral-50/80 border border-neutral-300 text-neutral-900 font-mono text-xs placeholder:text-neutral-400 hover:border-neutral-900 focus:border-neutral-900 focus:bg-white';
  } else if (styling.theme === 'modern') {
    inputClass += 'bg-white/50 backdrop-blur-xl border border-white/70 text-neutral-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] focus:bg-white/85';
  } else if (styling.theme === 'neobrutalist') {
    inputClass += 'border-2 border-black bg-white text-neutral-900 font-medium';
  } else {
    inputClass += 'border-neutral-200 bg-white text-neutral-900';
  }

  let buttonClass = `w-full text-white font-bold transition-all duration-200 ${buttonRadiusClass} py-3 h-11 `;
  if (styling.theme === 'neobrutalist') {
    buttonClass += 'border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5';
  } else if (styling.theme === 'minimal') {
    buttonClass += 'font-mono uppercase tracking-widest text-xs font-bold shadow-none hover:opacity-90 active:scale-[0.99]';
  } else if (styling.theme === 'modern') {
    buttonClass += 'shadow-lg hover:opacity-95 active:scale-[0.99] border border-white/30 backdrop-blur-md';
  } else {
    buttonClass += 'hover:opacity-90 active:scale-[0.99] shadow-sm';
  }

  // Generate component fields markup
  const labelClass = isDark ? 'text-sm font-semibold text-neutral-200' : 'text-sm font-semibold text-neutral-700';
  const subLabelClass = isDark ? 'text-sm font-normal text-neutral-300 cursor-pointer' : 'text-sm font-normal text-neutral-600 cursor-pointer';

  const fieldsMarkup = fields
    .map((field) => {
      const fieldId = toJsString(field.id);
      const errorRef = `errors[${fieldId}]`;
      const requiredAsterisk = field.required ? ' <span className="text-red-500">*</span>' : '';
      
      let fieldElement = '';
      
      switch (field.type) {
        case 'text':
        case 'email':
          fieldElement = `
        <div className="space-y-2">
          <Label htmlFor={${fieldId}} className="${labelClass}">
            {${toJsString(field.label)}}${requiredAsterisk}
          </Label>
          <Input
            id={${fieldId}}
            type="${field.type === 'email' ? 'email' : 'text'}"
            placeholder={${toJsString(field.placeholder || '')}}
            className="${inputClass}"
            {...register(${fieldId})}
          />
          {${errorRef} && (
            <p className="text-xs font-medium text-red-500">{${errorRef}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'textarea':
          fieldElement = `
        <div className="space-y-2">
          <Label htmlFor={${fieldId}} className="${labelClass}">
            {${toJsString(field.label)}}${requiredAsterisk}
          </Label>
          <Textarea
            id={${fieldId}}
            placeholder={${toJsString(field.placeholder || '')}}
            className="min-h-[100px] ${inputClass}"
            {...register(${fieldId})}
          />
          {${errorRef} && (
            <p className="text-xs font-medium text-red-500">{${errorRef}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'select':
          const selectOptions = (field.options || [])
            .map((opt) => `                <SelectItem value={${toJsString(opt)}}>{${toJsString(opt)}}</SelectItem>`)
            .join('\n');
            
          fieldElement = `
        <div className="space-y-2">
          <Label className="${labelClass}">
            {${toJsString(field.label)}}${requiredAsterisk}
          </Label>
          <Controller
            control={control}
            name={${fieldId}}
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value}>
                <SelectTrigger className="${inputClass}">
                  <SelectValue placeholder={${toJsString(field.placeholder || 'Select an option')}} />
                </SelectTrigger>
                <SelectContent>
${selectOptions}
                </SelectContent>
              </Select>
            )}
          />
          {${errorRef} && (
            <p className="text-xs font-medium text-red-500">{${errorRef}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'radio':
          const radioItems = (field.options || [])
            .map((opt) => {
              const optId = `${field.id}-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              return `              <div className="flex items-center space-x-2">
                <RadioGroupItem value={${toJsString(opt)}} id={${toJsString(optId)}} />
                <Label htmlFor={${toJsString(optId)}} className="${subLabelClass}">
                  {${toJsString(opt)}}
                </Label>
              </div>`;
            })
            .join('\n');
            
          fieldElement = `
        <div className="space-y-2">
          <Label className="${labelClass}">
            {${toJsString(field.label)}}${requiredAsterisk}
          </Label>
          <Controller
            control={control}
            name={${fieldId}}
            render={({ field: { onChange, value } }) => (
              <RadioGroup onValueChange={onChange} value={value} className="flex flex-col space-y-2 mt-1">
${radioItems}
              </RadioGroup>
            )}
          />
          {${errorRef} && (
            <p className="text-xs font-medium text-red-500">{${errorRef}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'checkbox':
          if (field.options && field.options.length > 0) {
            // Multi-checkbox rendering
            const checkboxItems = field.options
              .map((opt) => {
                const optionValue = toJsString(opt);
                return `              <div key={${optionValue}} className="flex items-row items-start space-x-3 space-y-0">
                <Checkbox
                  checked={value?.includes(${optionValue})}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onChange([...currentValues, ${optionValue}]);
                    } else {
                      onChange(currentValues.filter((val: string) => val !== ${optionValue}));
                    }
                  }}
                />
                <Label className="${subLabelClass}">
                  {${optionValue}}
                </Label>
              </div>`;
              })
              .join('\n');

            fieldElement = `
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-neutral-700">
            {${toJsString(field.label)}}${requiredAsterisk}
          </Label>
          <Controller
            control={control}
            name={${fieldId}}
            render={({ field: { onChange, value = [] } }) => (
              <div className="flex flex-col space-y-3 mt-1">
${checkboxItems}
              </div>
            )}
          />
          {${errorRef} && (
            <p className="text-xs font-medium text-red-500">{${errorRef}?.message}</p>
          )}
        </div>`;
          } else {
            // Single checkbox (boolean)
            fieldElement = `
        <div className="flex flex-row items-start space-x-3 space-y-0 py-2">
          <Controller
            control={control}
            name={${fieldId}}
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onCheckedChange={onChange} id={${fieldId}} />
            )}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor={${fieldId}} className="${labelClass} cursor-pointer">
              {${toJsString(field.label)}}${requiredAsterisk}
            </Label>
            {${errorRef} && (
              <p className="text-xs font-medium text-red-500 mt-1">{${errorRef}?.message}</p>
            )}
          </div>
        </div>`;
          }
          break;
          
        case 'file':
          fieldElement = `
        <div className="space-y-2">
          <Label htmlFor={${fieldId}} className="${labelClass}">
            {${toJsString(field.label)}}${requiredAsterisk}
          </Label>
          <Input
            id={${fieldId}}
            type="file"
            className="cursor-pointer ${inputClass}"
            {...register(${fieldId})}
          />
          {${errorRef} && (
            <p className="text-xs font-medium text-red-500">{${errorRef}?.message}</p>
          )}
        </div>`;
          break;
          
        default:
          break;
      }
      
      return fieldElement;
    })
    .join('\n');

  // Core component template string
  return `'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// shadcn UI Imports
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

import { ${schemaName}, type ${inputName} } from './schema';

export default function ${componentName}() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<${inputName}>({
    resolver: zodResolver(${schemaName}),
    defaultValues: {} as any
  });

  const onSubmit = async (data: ${inputName}) => {
    try {
      // In production, file elements require FormData. We handle files dynamically here:
      let payload: any = data;
      
      // Check if file fields exist and package into FormData if necessary
      const hasFiles = Object.keys(data).some(key => data[key as keyof ${inputName}] instanceof FileList);
      
      if (hasFiles) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof FileList) {
            if (value[0]) formData.append(key, value[0]);
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        payload = formData;
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: hasFiles ? undefined : {
          'Content-Type': 'application/json',
        },
        body: hasFiles ? payload : JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Form submitted successfully!');
        reset();
      } else {
        throw new Error(result.message || 'Submission failed.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Card className="${cardClass}">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
          {${toJsString(formName)}}
        </CardTitle>
        <CardDescription className="text-neutral-500">
          {${toJsString(description || 'Please fill out the form details below.')}}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
${fieldsMarkup}
        </CardContent>
        
        <CardFooter className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: ${toJsString(styling.primaryColor)} }}
            className="${buttonClass}"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
`;
}
