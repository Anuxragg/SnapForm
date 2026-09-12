'use client';

import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Mail,
  CreditCard,
  Sparkles,
  Calendar,
  UserPlus,
  MessageSquare,
  Briefcase,
  Tag,
} from 'lucide-react';
import { IFormField, IFormStyling } from '@/models/FormTemplate';
import { z } from 'zod';

interface LivePreviewProps {
  fields: IFormField[];
  styling: IFormStyling;
  formName: string;
  formDescription?: string;
  formCategory?: string;
}

const categoryLabels: Record<string, string> = {
  contact: 'Contact & Leads',
  payment: 'Payment & Checkout',
  survey: 'Feedback & Survey',
  booking: 'Booking & Scheduling',
  registration: 'Event Registration',
  feedback: 'User Feedback',
  application: 'Job Application',
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  contact: Mail,
  payment: CreditCard,
  survey: Sparkles,
  booking: Calendar,
  registration: UserPlus,
  feedback: MessageSquare,
  application: Briefcase,
};

function LivePreviewForm({
  fields,
  styling,
  labelColor,
  subLabelColor,
  inputClass,
  buttonClass,
  buttonInlineStyle,
  isDarkTheme,
}: {
  fields: IFormField[];
  styling: IFormStyling;
  labelColor: string;
  subLabelColor: string;
  inputClass: string;
  buttonClass: string;
  buttonInlineStyle: React.CSSProperties;
  isDarkTheme: boolean;
}) {
  const dynamicSchema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field, idx) => {
      const fieldId = field.id?.trim() || `field_${idx}`;
      let fieldValidation: z.ZodTypeAny = z.string();

      switch (field.type) {
        case 'email':
          if (field.required) {
            fieldValidation = z.string().min(1, 'Email is required').email('Invalid email address');
          } else {
            fieldValidation = z.union([z.string().email('Invalid email address'), z.literal('')]).optional();
          }
          break;

        case 'textarea':
        case 'text': {
          let base = z.string();

          if (field.required) {
            const minLen = field.validation?.minLength ?? 1;
            const minMsg = minLen > 1
              ? `${field.label || 'Field'} must be at least ${minLen} characters`
              : `${field.label || 'Field'} is required`;
            base = base.min(minLen, minMsg);
          } else if (field.validation?.minLength) {
            base = base.min(field.validation.minLength, `Minimum length is ${field.validation.minLength}`);
          }

          if (field.validation?.maxLength) {
            base = base.max(field.validation.maxLength, `Maximum length is ${field.validation.maxLength}`);
          }

          if (field.validation?.pattern) {
            try {
              const regex = new RegExp(field.validation.pattern);
              base = base.regex(regex, 'Invalid format');
            } catch { /* ignore invalid regex */ }
          }

          fieldValidation = field.required ? base : base.optional().or(z.literal(''));
          break;
        }

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
              fieldValidation = z.boolean().refine((val) => val === true, 'You must accept this field');
            } else {
              fieldValidation = z.boolean().default(false);
            }
          }
          break;

        case 'file':
          if (field.required) {
            fieldValidation = z.any().refine((files) => files && files.length > 0, 'File is required');
          } else {
            fieldValidation = z.any().optional();
          }
          break;

        default:
          fieldValidation = z.string().optional();
      }

      shape[fieldId] = fieldValidation;
    });

    return z.object(shape);
  }, [fields]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    mode: 'onSubmit',
  });

  const onSubmit = (data: any) => {
    console.log('Live Preview submission:', data);
    toast.success('Preview submitted successfully! Validated fields output logged to dev console.', {
      duration: 3500,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-5 text-left">
        {fields.map((field, idx) => {
          const fieldId = field.id?.trim() || `field_${idx}`;
          const requiredAsterisk = field.required ? (
            <span className="text-rose-500 font-bold ml-0.5">*</span>
          ) : null;

          let element: React.ReactNode = null;
          const fieldErr = (errors as any)[fieldId];

          switch (field.type) {
            case 'text':
            case 'email':
              element = (
                <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                  <Label htmlFor={`preview-${fieldId}`} className={`text-sm ${labelColor}`}>
                    {field.label}
                    {requiredAsterisk}
                  </Label>
                  <Input
                    id={`preview-${fieldId}`}
                    type={field.type === 'email' ? 'email' : 'text'}
                    placeholder={field.placeholder || ''}
                    className={inputClass}
                    {...register(fieldId)}
                  />
                  {fieldErr && (
                    <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                  )}
                </div>
              );
              break;

            case 'textarea':
              element = (
                <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                  <Label htmlFor={`preview-${fieldId}`} className={`text-sm ${labelColor}`}>
                    {field.label}
                    {requiredAsterisk}
                  </Label>
                  <Textarea
                    id={`preview-${fieldId}`}
                    placeholder={field.placeholder || ''}
                    className={`min-h-[100px] ${inputClass}`}
                    {...register(fieldId)}
                  />
                  {fieldErr && (
                    <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                  )}
                </div>
              );
              break;

            case 'select':
              element = (
                <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                  <Label className={`text-sm ${labelColor}`}>
                    {field.label}
                    {requiredAsterisk}
                  </Label>
                  <Controller
                    control={control}
                    name={fieldId}
                    render={({ field: { onChange, value } }) => (
                      <Select onValueChange={onChange} value={value || ''}>
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder={field.placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent className={`rounded-xl ${isDarkTheme ? 'bg-[#181f2c] border-neutral-700 text-white' : 'bg-white'}`}>
                          {(field.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt} className={`text-sm ${isDarkTheme ? 'text-neutral-200 focus:bg-neutral-700 focus:text-white' : ''}`}>
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
                <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                  <Label className={`text-sm ${labelColor}`}>
                    {field.label}
                    {requiredAsterisk}
                  </Label>
                  <Controller
                    control={control}
                    name={fieldId}
                    render={({ field: { onChange, value } }) => (
                      <RadioGroup onValueChange={onChange} value={value || ''} className="flex flex-col space-y-2 mt-1">
                        {(field.options || []).map((opt) => {
                          const optId = `preview-opt-${fieldId}-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                          const isChecked = value === opt;
                          return (
                            <label
                              key={opt}
                              htmlFor={optId}
                              className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? isDarkTheme
                                    ? 'border-brand-orange bg-[#1f2838]'
                                    : 'border-brand-orange bg-brand-orange/5'
                                  : isDarkTheme
                                    ? 'border-neutral-800 bg-[#161c28] hover:bg-[#1c2433]'
                                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                              }`}
                            >
                              <RadioGroupItem value={opt} id={optId} className="cursor-pointer" />
                              <span className={`text-sm font-normal ${subLabelColor} cursor-pointer`}>
                                {opt}
                              </span>
                            </label>
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
                element = (
                  <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                    <Label className={`text-sm ${labelColor}`}>
                      {field.label}
                      {requiredAsterisk}
                    </Label>
                    <Controller
                      control={control}
                      name={fieldId}
                      render={({ field: { onChange, value = [] } }) => (
                        <div className="flex flex-col space-y-2 mt-1">
                          {(field.options || []).map((opt) => {
                            const optId = `preview-opt-${fieldId}-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                            const isChecked = Array.isArray(value) && value.includes(opt);
                            return (
                              <label
                                key={opt}
                                htmlFor={optId}
                                className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? isDarkTheme
                                      ? 'border-brand-orange bg-[#1f2838]'
                                      : 'border-brand-orange bg-brand-orange/5'
                                    : isDarkTheme
                                      ? 'border-neutral-800 bg-[#161c28] hover:bg-[#1c2433]'
                                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                                }`}
                              >
                                <Checkbox
                                  id={optId}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      onChange([...(value || []), opt]);
                                    } else {
                                      onChange((value || []).filter((v: string) => v !== opt));
                                    }
                                  }}
                                  className="cursor-pointer"
                                />
                                <span className={`text-sm font-normal ${subLabelColor} cursor-pointer`}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                    {fieldErr && (
                      <p className="text-xs font-medium text-rose-500">{fieldErr.message}</p>
                    )}
                  </div>
                );
              } else {
                element = (
                  <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                    <div className="flex items-center space-x-2.5 pt-1">
                      <Controller
                        control={control}
                        name={fieldId}
                        render={({ field: { onChange, value } }) => (
                          <Checkbox
                            id={`preview-${fieldId}`}
                            checked={!!value}
                            onCheckedChange={onChange}
                          />
                        )}
                      />
                      <Label
                        htmlFor={`preview-${fieldId}`}
                        className={`text-sm cursor-pointer ${labelColor}`}
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
                <div key={`${fieldId}-${idx}`} className="space-y-1.5">
                  <Label htmlFor={`preview-${fieldId}`} className={`text-sm ${labelColor}`}>
                    {field.label}
                    {requiredAsterisk}
                  </Label>
                  <Input
                    id={`preview-${fieldId}`}
                    type="file"
                    className={`cursor-pointer ${inputClass}`}
                    {...register(fieldId)}
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
      </div>

      <div className="pt-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          style={buttonInlineStyle}
          className={buttonClass}
        >
          {isSubmitting ? 'Simulating submit...' : 'Submit Form'}
        </Button>
      </div>
    </form>
  );
}

export default function LivePreview({
  fields,
  styling,
  formName,
  formDescription,
  formCategory,
}: LivePreviewProps) {
  const isMinimal = styling.theme === 'minimal';
  const isDarkTheme = styling.theme === 'dark';
  const isNeobrutalist = styling.theme === 'neobrutalist';
  const isLiquidGlass = styling.theme === 'modern' || !styling.theme;

  // 1. Calculate Radius according to theme
  let radiusClass = 'rounded-2xl';
  let inputRadiusClass = 'rounded-xl';
  let buttonRadiusClass = 'rounded-xl';

  if (isMinimal || isNeobrutalist) {
    radiusClass = 'rounded-none';
    inputRadiusClass = 'rounded-none';
    buttonRadiusClass = 'rounded-none';
  } else if (isDarkTheme) {
    radiusClass = 'rounded-2xl';
    inputRadiusClass = 'rounded-xl';
    buttonRadiusClass = 'rounded-xl';
  } else {
    // Liquid Glass
    radiusClass = 'rounded-3xl';
    inputRadiusClass = 'rounded-2xl';
    buttonRadiusClass = 'rounded-2xl';
  }

  // 2. Calculate Theme & Card styling
  let cardClass = '';
  let labelColor = 'text-neutral-700 font-bold';
  let subLabelColor = 'text-neutral-600';
  let titleColor = 'text-neutral-900';
  let descColor = 'text-neutral-500';

  if (isDarkTheme) {
    labelColor = 'text-neutral-200 font-semibold';
    subLabelColor = 'text-neutral-300';
    titleColor = 'text-white';
    descColor = 'text-neutral-400';
    cardClass = `border border-neutral-800 bg-[#121620] text-white ${radiusClass} shadow-2xl p-6 sm:p-8`;
  } else if (isNeobrutalist) {
    labelColor = 'text-black font-extrabold uppercase text-xs tracking-wider';
    subLabelColor = 'text-neutral-800 font-bold';
    titleColor = 'text-black font-black uppercase tracking-tight';
    descColor = 'text-neutral-600 font-medium';
    cardClass = `border-2 border-black bg-white ${radiusClass} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8`;
  } else if (isMinimal) {
    labelColor = 'text-neutral-900 font-mono font-bold uppercase text-[11px] tracking-widest';
    subLabelColor = 'text-neutral-700 font-mono text-xs';
    titleColor = 'text-neutral-950 font-mono font-bold tracking-tight text-xl';
    descColor = 'text-neutral-500 font-mono text-xs';
    cardClass = `border-2 border-neutral-900 bg-white ${radiusClass} shadow-none p-6 sm:p-10`;
  } else {
    // Liquid Glass
    labelColor = 'text-neutral-800 font-bold';
    subLabelColor = 'text-neutral-600';
    titleColor = 'text-neutral-950 font-extrabold';
    descColor = 'text-neutral-500 font-medium';
    cardClass = `backdrop-blur-3xl bg-white/45 border border-white/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),0_10px_20px_-5px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,0.9),inset_0_-1.5px_2px_rgba(0,0,0,0.03)] ${radiusClass} p-6 sm:p-8 relative overflow-hidden`;
  }

  // 3. Calculate Input Field Variant
  let inputClass = `${inputRadiusClass} transition-all `;
  if (isDarkTheme) {
    inputClass += 'bg-[#181f2c] border border-neutral-700/80 text-white placeholder:text-neutral-500 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20';
  } else if (isMinimal) {
    inputClass += 'bg-neutral-50/80 border border-neutral-300 text-neutral-900 font-mono text-xs placeholder:text-neutral-400 hover:border-neutral-900 focus:border-neutral-900 focus:bg-white focus:ring-0';
  } else if (isNeobrutalist) {
    inputClass += 'border-2 border-black bg-white text-neutral-900 font-medium focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
  } else {
    // Liquid Glass
    inputClass += 'bg-white/50 backdrop-blur-xl border border-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.02)] text-neutral-900 placeholder:text-neutral-400 hover:bg-white/65 focus:bg-white/85 focus:border-white focus:ring-4 focus:ring-brand-orange/20';
  }

  // 4. Calculate Button Style
  let buttonClass = `w-full font-bold transition-all duration-200 cursor-pointer ${buttonRadiusClass} py-2.5 h-11 `;
  let buttonInlineStyle: React.CSSProperties = {};

  const primaryColor = styling.primaryColor || '#ff4f19';

  if (isNeobrutalist) {
    buttonInlineStyle = {
      backgroundColor: primaryColor,
      boxShadow: '4px 4px 0px 0px #000000',
    };
    buttonClass += 'text-white border-2 border-black active:translate-x-0.5 active:translate-y-0.5';
  } else if (isMinimal) {
    buttonInlineStyle = {
      backgroundColor: primaryColor,
    };
    buttonClass += 'text-white font-mono uppercase tracking-widest text-xs font-bold shadow-none hover:opacity-90 active:scale-[0.99]';
  } else if (isDarkTheme) {
    buttonInlineStyle = {
      backgroundColor: primaryColor,
      boxShadow: `0 8px 25px -4px ${primaryColor}77, inset 0 1px 1px rgba(255,255,255,0.3)`,
    };
    buttonClass += 'text-white hover:opacity-95 active:scale-[0.99] relative';
  } else {
    // Liquid Glass
    buttonInlineStyle = {
      background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}e6 100%)`,
      boxShadow: `0 10px 28px -4px ${primaryColor}55, inset 0 1.5px 1.5px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.12)`,
    };
    buttonClass += 'text-white hover:opacity-95 active:scale-[0.99] relative border border-white/30 backdrop-blur-md';
  }

  const formKey = useMemo(() => {
    return fields.map((f, i) => `${f.id || `f_${i}`}-${f.type}-${f.required}`).join('_');
  }, [fields]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 relative py-4">
      {/* Ambient colorful fluid mesh background for Liquid Glass refraction */}
      {isLiquidGlass && (
        <div className="absolute -inset-12 pointer-events-none overflow-visible -z-10">
          <div
            className="absolute -top-12 -left-12 w-80 h-80 rounded-full blur-2xl opacity-75 animate-pulse"
            style={{ backgroundColor: `${primaryColor}40` }}
          />
          <div className="absolute top-1/4 -right-12 w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/35 to-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-16 left-1/6 w-88 h-88 rounded-full bg-gradient-to-tr from-cyan-400/40 via-sky-300/30 to-emerald-300/30 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-pink-400/25 blur-2xl" />
        </div>
      )}
      {fields.length === 0 ? (
        <div className="border border-dashed border-neutral-200 p-12 text-center rounded-2xl bg-white/60">
          <p className="text-sm font-medium text-neutral-500">Your live preview is empty.</p>
          <p className="text-xs text-neutral-400 mt-1">Configure fields in the visual panel to visualize in real-time.</p>
        </div>
      ) : (
        <div className={`${cardClass} transition-all duration-300`}>
          <div className="text-left mb-6 space-y-2">
            {formCategory && (
              <div className="flex items-center">
                {(() => {
                  const CategoryIcon = categoryIcons[formCategory] || Tag;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-wide ${
                        isNeobrutalist
                          ? 'border-2 border-black bg-black text-white rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase text-[10px] font-black'
                          : isMinimal
                            ? 'border border-neutral-900 bg-neutral-100 text-neutral-900 font-mono rounded-none uppercase text-[10px] font-bold tracking-widest'
                            : isDarkTheme
                              ? 'rounded-full bg-[#181f2c]/90 backdrop-blur-md text-neutral-200 border border-neutral-700/80 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]'
                              : 'rounded-full bg-white/90 backdrop-blur-md text-neutral-800 border border-white shadow-[0_4px_14px_-2px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]'
                      }`}
                    >
                      <CategoryIcon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isNeobrutalist ? 'text-white' : isMinimal ? 'text-neutral-900' : ''
                        }`}
                        style={
                          !isNeobrutalist && !isMinimal
                            ? { color: primaryColor }
                            : undefined
                        }
                      />
                      <span className="leading-tight">{categoryLabels[formCategory] || formCategory}</span>
                    </span>
                  );
                })()}
              </div>
            )}
            <h2 className={`text-2xl font-bold tracking-tight ${titleColor} font-heading leading-tight pt-0.5`}>
              {formName || 'Crafted Form'}
            </h2>
            <p className={`text-xs sm:text-[13px] ${descColor} leading-relaxed`}>
              {formDescription || 'Please fill out the form details below.'}
            </p>
          </div>

          <LivePreviewForm
            key={formKey}
            fields={fields}
            styling={styling}
            labelColor={labelColor}
            subLabelColor={subLabelColor}
            inputClass={inputClass}
            buttonClass={buttonClass}
            buttonInlineStyle={buttonInlineStyle}
            isDarkTheme={isDarkTheme}
          />
        </div>
      )}
    </div>
  );
}
