import { IFormField, IFormStyling } from '@/models/FormTemplate';

export function generateReactComponent(
  fields: IFormField[],
  styling: IFormStyling,
  formName: string = 'Form'
): string {
  const componentName = formName.replace(/\s+/g, '');
  const schemaName = `${componentName}Schema`;
  const inputName = `${componentName}Input`;
  
  // Theme-specific CSS classes
  let cardClass = '';
  let inputClass = '';
  let buttonClass = 'w-full text-white font-medium transition-all duration-200 ';

  switch (styling.theme) {
    case 'minimal':
      cardClass = 'border border-neutral-200 bg-white rounded-none shadow-none p-6 max-w-lg mx-auto';
      inputClass = 'rounded-none border-neutral-300 focus:border-neutral-900 focus-visible:ring-0';
      buttonClass += 'rounded-none hover:opacity-90';
      break;
    case 'corporate':
      cardClass = 'border border-slate-300 bg-slate-50 rounded-md shadow-md p-6 max-w-lg mx-auto';
      inputClass = 'rounded-md border-slate-300 bg-white focus:border-slate-800';
      buttonClass += 'rounded-md shadow hover:brightness-95';
      break;
    case 'modern':
    default:
      cardClass = 'border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-neutral-100/50 p-8 max-w-lg mx-auto';
      inputClass = 'rounded-xl border-neutral-200 focus:ring-2';
      buttonClass += 'rounded-xl shadow-lg shadow-primary-500/20 hover:scale-[1.01] active:scale-[0.99]';
      break;
  }

  // Generate component fields markup
  const fieldsMarkup = fields
    .map((field) => {
      const requiredAsterisk = field.required ? ' <span className="text-red-500">*</span>' : '';
      
      let fieldElement = '';
      
      switch (field.type) {
        case 'text':
        case 'email':
          fieldElement = `
        <div className="space-y-2">
          <Label htmlFor="${field.id}" className="text-sm font-semibold text-neutral-700">
            ${field.label}${requiredAsterisk}
          </Label>
          <Input
            id="${field.id}"
            type="${field.type === 'email' ? 'email' : 'text'}"
            placeholder="${field.placeholder || ''}"
            className="${inputClass}"
            {...register('${field.id}')}
          />
          {errors.${field.id} && (
            <p className="text-xs font-medium text-red-500">{errors.${field.id}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'textarea':
          fieldElement = `
        <div className="space-y-2">
          <Label htmlFor="${field.id}" className="text-sm font-semibold text-neutral-700">
            ${field.label}${requiredAsterisk}
          </Label>
          <Textarea
            id="${field.id}"
            placeholder="${field.placeholder || ''}"
            className="min-h-[100px] ${inputClass}"
            {...register('${field.id}')}
          />
          {errors.${field.id} && (
            <p className="text-xs font-medium text-red-500">{errors.${field.id}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'select':
          const selectOptions = (field.options || [])
            .map((opt) => `                <SelectItem value="${opt}">${opt}</SelectItem>`)
            .join('\n');
            
          fieldElement = `
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-neutral-700">
            ${field.label}${requiredAsterisk}
          </Label>
          <Controller
            control={control}
            name="${field.id}"
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={onChange} value={value}>
                <SelectTrigger className="${inputClass}">
                  <SelectValue placeholder="${field.placeholder || 'Select an option'}" />
                </SelectTrigger>
                <SelectContent>
${selectOptions}
                </SelectContent>
              </Select>
            )}
          />
          {errors.${field.id} && (
            <p className="text-xs font-medium text-red-500">{errors.${field.id}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'radio':
          const radioItems = (field.options || [])
            .map((opt) => {
              const optId = `${field.id}-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              return `              <div className="flex items-center space-x-2">
                <RadioGroupItem value="${opt}" id="${optId}" />
                <Label htmlFor="${optId}" className="text-sm font-normal text-neutral-600 cursor-pointer">
                  ${opt}
                </Label>
              </div>`;
            })
            .join('\n');
            
          fieldElement = `
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-neutral-700">
            ${field.label}${requiredAsterisk}
          </Label>
          <Controller
            control={control}
            name="${field.id}"
            render={({ field: { onChange, value } }) => (
              <RadioGroup onValueChange={onChange} value={value} className="flex flex-col space-y-2 mt-1">
${radioItems}
              </RadioGroup>
            )}
          />
          {errors.${field.id} && (
            <p className="text-xs font-medium text-red-500">{errors.${field.id}?.message}</p>
          )}
        </div>`;
          break;
          
        case 'checkbox':
          if (field.options && field.options.length > 0) {
            // Multi-checkbox rendering
            const checkboxItems = field.options
              .map((opt) => {
                const optEscaped = opt.replace(/'/g, "\\'");
                return `              <div key="${opt}" className="flex items-row items-start space-x-3 space-y-0">
                <Checkbox
                  checked={value?.includes('${optEscaped}')}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onChange([...currentValues, '${optEscaped}']);
                    } else {
                      onChange(currentValues.filter((val: string) => val !== '${optEscaped}'));
                    }
                  }}
                />
                <Label className="text-sm font-normal text-neutral-600 cursor-pointer">
                  ${opt}
                </Label>
              </div>`;
              })
              .join('\n');

            fieldElement = `
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-neutral-700">
            ${field.label}${requiredAsterisk}
          </Label>
          <Controller
            control={control}
            name="${field.id}"
            render={({ field: { onChange, value = [] } }) => (
              <div className="flex flex-col space-y-3 mt-1">
${checkboxItems}
              </div>
            )}
          />
          {errors.${field.id} && (
            <p className="text-xs font-medium text-red-500">{errors.${field.id}?.message}</p>
          )}
        </div>`;
          } else {
            // Single checkbox (boolean)
            fieldElement = `
        <div className="flex flex-row items-start space-x-3 space-y-0 py-2">
          <Controller
            control={control}
            name="${field.id}"
            render={({ field: { onChange, value } }) => (
              <Checkbox checked={value} onCheckedChange={onChange} id="${field.id}" />
            )}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="${field.id}" className="text-sm font-semibold text-neutral-700 cursor-pointer">
              ${field.label}${requiredAsterisk}
            </Label>
            {errors.${field.id} && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.${field.id}?.message}</p>
            )}
          </div>
        </div>`;
          }
          break;
          
        case 'file':
          fieldElement = `
        <div className="space-y-2">
          <Label htmlFor="${field.id}" className="text-sm font-semibold text-neutral-700">
            ${field.label}${requiredAsterisk}
          </Label>
          <Input
            id="${field.id}"
            type="file"
            className="cursor-pointer ${inputClass}"
            {...register('${field.id}')}
          />
          {errors.${field.id} && (
            <p className="text-xs font-medium text-red-500">{errors.${field.id}?.message}</p>
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
          ${formName}
        </CardTitle>
        <CardDescription className="text-neutral-500">
          Please fill out the form details below.
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
            style={{ backgroundColor: '${styling.primaryColor}' }}
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
