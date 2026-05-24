'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { IFormField, IFormStyling } from '@/models/FormTemplate';
import { z } from 'zod';

interface LivePreviewProps {
  fields: IFormField[];
  styling: IFormStyling;
  formName: string;
}

export default function LivePreview({ fields, styling, formName }: LivePreviewProps) {
  // Let's dynamically construct a Zod schema in the frontend to validate the interactive preview!
  const buildDynamicZodSchema = () => {
    const shape: any = {};

    fields.forEach((field) => {
      let fieldValidation: any = z.string();

      switch (field.type) {
        case 'email':
          fieldValidation = z.string().email('Invalid email address');
          if (field.required) {
            fieldValidation = fieldValidation.min(1, 'Email is required');
          } else {
            fieldValidation = z.union([z.string().email('Invalid email address'), z.literal('')]).optional();
          }
          break;

        case 'textarea':
        case 'text':
          fieldValidation = z.string();
          if (field.required) {
            fieldValidation = fieldValidation.min(field.validation?.minLength || 1, `${field.label} is required`);
          } else {
            fieldValidation = fieldValidation.optional().or(z.literal(''));
          }

          if (field.validation?.minLength && field.required) {
            if (field.validation.minLength > 1) {
              fieldValidation = fieldValidation.min(field.validation.minLength, `Minimum length is ${field.validation.minLength}`);
            }
          }
          if (field.validation?.maxLength) {
            fieldValidation = fieldValidation.max(field.validation.maxLength, `Maximum length is ${field.validation.maxLength}`);
          }
          if (field.validation?.pattern) {
            try {
              const regex = new RegExp(field.validation.pattern);
              fieldValidation = fieldValidation.regex(regex, 'Invalid format');
            } catch { }
          }
          break;

        case 'select':
        case 'radio':
          if (field.options && field.options.length > 0) {
            fieldValidation = z.enum(field.options as [string, ...string[]]);
          } else {
            fieldValidation = z.string();
          }
          if (field.required) {
            fieldValidation = fieldValidation;
          } else {
            fieldValidation = z.union([fieldValidation, z.literal('')]).optional();
          }
          break;

        case 'checkbox':
          if (field.options && field.options.length > 0) {
            fieldValidation = z.array(z.string());
            if (field.required) {
              fieldValidation = fieldValidation.min(1, 'Select at least one option');
            } else {
              fieldValidation = fieldValidation.optional();
            }
          } else {
            if (field.required) {
              fieldValidation = z.boolean().refine(val => val === true, 'You must accept this field');
            } else {
              fieldValidation = z.boolean().default(false);
            }
          }
          break;

        case 'file':
          if (field.required) {
            fieldValidation = z.any().refine((files) => {
              return files && files.length > 0;
            }, 'File is required');
          } else {
            fieldValidation = z.any().optional();
          }
          break;

        default:
          fieldValidation = z.string().optional();
      }

      shape[field.id] = fieldValidation;
    });

    return z.object(shape);
  };

  const dynamicSchema = buildDynamicZodSchema();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    mode: 'onSubmit',
  });

  // Re-initialize values and clear errors whenever fields layout changes
  useEffect(() => {
    reset({});
  }, [fields, reset]);

  const onSubmit = (data: any) => {
    console.log('Live Preview submission:', data);
    toast.success('Preview submitted successfully! Validated fields output logged to dev console.', {
      duration: 3500,
    });
  };

  // Layout themes
  let cardClass = '';
  let inputClass = '';
  let buttonClass = 'w-full text-white font-medium transition-all duration-200 cursor-pointer ';

  switch (styling.theme) {
    case 'minimal':
      cardClass = 'border border-neutral-200 bg-white rounded-none shadow-none p-6';
      inputClass = 'rounded-none border-neutral-300 focus:border-neutral-900 focus-visible:ring-0';
      buttonClass += 'rounded-none hover:opacity-90';
      break;
    case 'corporate':
      cardClass = 'border border-slate-300 bg-slate-50 rounded-md shadow-md p-6';
      inputClass = 'rounded-md border-slate-300 bg-white focus:border-slate-800';
      buttonClass += 'rounded-md shadow hover:brightness-95';
      break;
    case 'modern':
    default:
      cardClass = 'border border-brand-border bg-white rounded-2xl shadow-xl shadow-brand-charcoal/5 p-8';
      inputClass = 'rounded-xl border-brand-border focus:ring-2 focus:ring-brand-orange/20';
      buttonClass += 'rounded-xl shadow-lg shadow-brand-orange/10 hover:scale-[1.01] active:scale-[0.99]';
      break;
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Canvas Header */}
      <div className="flex items-center gap-2 text-neutral-400 bg-neutral-50 border border-neutral-200/40 px-4 py-2.5 rounded-2xl w-fit mx-auto text-xs font-semibold shadow-sm">
        <Eye className="w-3.5 h-3.5 text-neutral-500" /> Interactive Live Preview Canvas
      </div>

      {fields.length === 0 ? (
        <Card className="border border-dashed border-neutral-200 p-12 text-center rounded-2xl bg-white/60">
          <p className="text-sm font-medium text-neutral-500">Your live preview is empty.</p>
          <p className="text-xs text-neutral-400 mt-1">Configure fields in the visual panel to visualize in real-time.</p>
        </Card>
      ) : (
        <Card className={`${cardClass} transition-all duration-300`}>
          <CardHeader className="space-y-1.5 text-left">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900">
              {formName || 'Crafted Form'}
            </CardTitle>
            <CardDescription className="text-neutral-500">
              Please fill out the form details below.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5 text-left">
              {fields.map((field) => {
                const requiredAsterisk = field.required ? (
                  <span className="text-rose-500 font-bold ml-0.5">*</span>
                ) : null;

                let element = null;
                const fieldErr = (errors as any)[field.id];

                switch (field.type) {
                  case 'text':
                  case 'email':
                    element = (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={`preview-${field.id}`} className="text-sm font-bold text-neutral-700">
                          {field.label}
                          {requiredAsterisk}
                        </Label>
                        <Input
                          id={`preview-${field.id}`}
                          type={field.type === 'email' ? 'email' : 'text'}
                          placeholder={field.placeholder || ''}
                          className={inputClass}
                          {...register(field.id)}
                        />
                        {fieldErr && (
                          <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                        )}
                      </div>
                    );
                    break;

                  case 'textarea':
                    element = (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={`preview-${field.id}`} className="text-sm font-bold text-neutral-700">
                          {field.label}
                          {requiredAsterisk}
                        </Label>
                        <Textarea
                          id={`preview-${field.id}`}
                          placeholder={field.placeholder || ''}
                          className={`min-h-[100px] ${inputClass}`}
                          {...register(field.id)}
                        />
                        {fieldErr && (
                          <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                        )}
                      </div>
                    );
                    break;

                  case 'select':
                    element = (
                      <div key={field.id} className="space-y-1.5">
                        <Label className="text-sm font-bold text-neutral-700">
                          {field.label}
                          {requiredAsterisk}
                        </Label>
                        <Controller
                          control={control}
                          name={field.id}
                          render={({ field: { onChange, value } }) => (
                            <Select onValueChange={onChange} value={value || ''}>
                              <SelectTrigger className={`bg-white ${inputClass}`}>
                                <SelectValue placeholder={field.placeholder || 'Select an option'} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {(field.options || []).map((opt) => (
                                  <SelectItem key={opt} value={opt} className="text-sm">
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {fieldErr && (
                          <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                        )}
                      </div>
                    );
                    break;

                  case 'radio':
                    element = (
                      <div key={field.id} className="space-y-1.5">
                        <Label className="text-sm font-bold text-neutral-700">
                          {field.label}
                          {requiredAsterisk}
                        </Label>
                        <Controller
                          control={control}
                          name={field.id}
                          render={({ field: { onChange, value } }) => (
                            <RadioGroup onValueChange={onChange} value={value || ''} className="flex flex-col space-y-2 mt-1">
                              {(field.options || []).map((opt) => {
                                const optId = `preview-opt-${field.id}-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                                return (
                                  <div key={opt} className="flex items-center space-x-2.5">
                                    <RadioGroupItem value={opt} id={optId} className="cursor-pointer" />
                                    <Label htmlFor={optId} className="text-sm font-normal text-neutral-600 cursor-pointer">
                                      {opt}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          )}
                        />
                        {fieldErr && (
                          <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                        )}
                      </div>
                    );
                    break;

                  case 'checkbox':
                    if (field.options && field.options.length > 0) {
                      // Multi-checkbox
                      element = (
                        <div key={field.id} className="space-y-1.5">
                          <Label className="text-sm font-bold text-neutral-700">
                            {field.label}
                            {requiredAsterisk}
                          </Label>
                          <Controller
                            control={control}
                            name={field.id}
                            render={({ field: { onChange, value = [] } }) => (
                              <div className="flex flex-col space-y-2.5 mt-1">
                                {field.options!.map((opt) => (
                                  <div key={opt} className="flex items-start space-x-2.5">
                                    <Checkbox
                                      id={`preview-chk-${field.id}-${opt}`}
                                      checked={((value as string[]) || []).includes(opt)}
                                      className="cursor-pointer mt-0.5"
                                      onCheckedChange={(checked) => {
                                        const current = (value as string[]) || [];
                                        if (checked) {
                                          onChange([...current, opt]);
                                        } else {
                                          onChange(current.filter((val: string) => val !== opt));
                                        }
                                      }}
                                    />
                                    <Label
                                      htmlFor={`preview-chk-${field.id}-${opt}`}
                                      className="text-sm font-normal text-neutral-600 cursor-pointer leading-none"
                                    >
                                      {opt}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                          {fieldErr && (
                            <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                          )}
                        </div>
                      );
                    } else {
                      // Single checkbox (boolean)
                      element = (
                        <div key={field.id} className="space-y-1">
                          <div className="flex flex-row items-start space-x-2.5 space-y-0 py-1.5">
                            <Controller
                              control={control}
                              name={field.id}
                              render={({ field: { onChange, value } }) => (
                                <Checkbox
                                  checked={!!value}
                                  onCheckedChange={onChange}
                                  id={`preview-${field.id}`}
                                  className="cursor-pointer mt-0.5"
                                />
                              )}
                            />
                            <Label
                              htmlFor={`preview-${field.id}`}
                              className="text-sm font-bold text-neutral-700 cursor-pointer leading-tight"
                            >
                              {field.label}
                              {requiredAsterisk}
                            </Label>
                          </div>
                          {fieldErr && (
                            <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                          )}
                        </div>
                      );
                    }
                    break;

                  case 'file':
                    element = (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={`preview-${field.id}`} className="text-sm font-bold text-neutral-700">
                          {field.label}
                          {requiredAsterisk}
                        </Label>
                        <Input
                          id={`preview-${field.id}`}
                          type="file"
                          className={`cursor-pointer bg-white ${inputClass}`}
                          {...register(field.id)}
                        />
                        {fieldErr && (
                          <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                        )}
                      </div>
                    );
                    break;

                  default:
                    break;
                }

                return element;
              })}
            </CardContent>

            <CardFooter className="pt-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: styling.primaryColor }}
                className={buttonClass}
              >
                {isSubmitting ? 'Simulating submit...' : 'Submit Form'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
