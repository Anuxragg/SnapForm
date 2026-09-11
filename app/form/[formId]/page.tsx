'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
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
import { SnapFormIcon } from '@/components/Logo';

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

interface PublicFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: IFormField[];
  styling: IFormStyling;
  isPredefined?: boolean;
}

function HostedFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params?.formId as string;

  const themeOverride = searchParams?.get('theme') as any;
  const colorOverride = searchParams?.get('primaryColor') || searchParams?.get('color');

  const [form, setForm] = useState<PublicFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;

    async function loadForm() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/form/${formId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Form not found');
        }

        setForm(json.data);

        const initialData: Record<string, any> = {};
        if (Array.isArray(json.data.fields)) {
          json.data.fields.forEach((field: IFormField) => {
            if (field.type === 'checkbox') {
              initialData[field.id] = false;
            } else if (field.type === 'select' && field.options && field.options.length > 0) {
              initialData[field.id] = '';
            } else {
              initialData[field.id] = '';
            }
          });
        }
        setFormData(initialData);
      } catch (err: any) {
        console.error('Error fetching form:', err);
        setError(err.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    if (!form?.fields) return true;
    const errors: Record<string, string> = {};

    for (const field of form.fields) {
      const val = formData[field.id];

      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (field.type === 'checkbox' && val !== true)
        ) {
          errors[field.id] = `${field.label || 'This field'} is required`;
          continue;
        }
      }

      if (val !== undefined && val !== null && val !== '') {
        if (field.type === 'email' && typeof val === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            errors[field.id] = 'Please enter a valid email address';
          }
        }

        if (typeof val === 'string' && field.validation) {
          if (field.validation.minLength && val.length < field.validation.minLength) {
            errors[field.id] = `Must be at least ${field.validation.minLength} characters`;
          }
          if (field.validation.maxLength && val.length > field.validation.maxLength) {
            errors[field.id] = `Must not exceed ${field.validation.maxLength} characters`;
          }
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/form/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errors) {
          setFieldErrors(json.errors);
        }
        throw new Error(json.message || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmitError(null);
    setFieldErrors({});
    const initialData: Record<string, any> = {};
    if (form?.fields) {
      form.fields.forEach((field) => {
        initialData[field.id] = field.type === 'checkbox' ? false : '';
      });
    }
    setFormData(initialData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center p-4 font-sans antialiased text-neutral-900">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Loading Form</h3>
            <p className="text-xs text-neutral-500 mt-1">Preparing your secure submission portal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center p-4 font-sans antialiased text-neutral-900">
        <div className="max-w-md w-full bg-white border border-neutral-200/80 rounded-2xl p-8 text-center shadow-lg shadow-neutral-100">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Form Not Available</h2>
          <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
            {error || 'The requested form could not be found or is no longer accepting responses.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-charcoal text-white font-semibold hover:bg-black transition-all text-xs w-full shadow-sm"
          >
            Go to SnapForm Home
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic styling calculation with query param override support
  const styling: IFormStyling = {
    primaryColor: colorOverride || form?.styling?.primaryColor || '#ff4f19',
    theme: themeOverride || form?.styling?.theme || 'modern',
    borderRadius: form?.styling?.borderRadius || 'rounded',
    inputVariant: form?.styling?.inputVariant || 'outlined',
    buttonStyle: form?.styling?.buttonStyle || 'solid',
  };

  const isDarkTheme = styling.theme === 'dark';
  const isMinimal = styling.theme === 'minimal';
  const isNeobrutalist = styling.theme === 'neobrutalist';

  let radiusClass = 'rounded-2xl sm:rounded-3xl';
  let inputRadiusClass = 'rounded-xl';
  let buttonRadiusClass = 'rounded-xl';

  if (isMinimal || isNeobrutalist) {
    radiusClass = 'rounded-none';
    inputRadiusClass = 'rounded-none';
    buttonRadiusClass = 'rounded-none';
  } else if (isDarkTheme) {
    radiusClass = 'rounded-2xl sm:rounded-3xl';
    inputRadiusClass = 'rounded-xl';
    buttonRadiusClass = 'rounded-xl';
  } else {
    radiusClass = 'rounded-3xl';
    inputRadiusClass = 'rounded-2xl';
    buttonRadiusClass = 'rounded-2xl';
  }

  let labelColor = 'text-neutral-700 font-bold';
  let titleColor = 'text-neutral-900 font-heading';
  let descColor = 'text-neutral-500';

  let cardClass = '';
  if (isDarkTheme) {
    labelColor = 'text-neutral-200';
    titleColor = 'text-white';
    descColor = 'text-neutral-400';
    cardClass = `border border-neutral-800 bg-[#131722] ${radiusClass} shadow-2xl p-6 sm:p-10 text-white`;
  } else if (isNeobrutalist) {
    labelColor = 'text-black font-extrabold uppercase text-xs';
    titleColor = 'text-black font-black uppercase tracking-tight';
    descColor = 'text-neutral-600';
    cardClass = `border-2 border-black bg-white ${radiusClass} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10`;
  } else if (isMinimal) {
    labelColor = 'text-neutral-900 font-mono font-bold uppercase text-[11px] tracking-widest';
    titleColor = 'text-neutral-950 font-mono font-bold tracking-tight';
    descColor = 'text-neutral-500 font-mono text-xs';
    cardClass = `border-2 border-neutral-900 bg-white ${radiusClass} shadow-none p-6 sm:p-10`;
  } else {
    // Liquid Glass
    labelColor = 'text-neutral-800 font-bold';
    titleColor = 'text-neutral-900 font-extrabold';
    descColor = 'text-neutral-500';
    cardClass = `backdrop-blur-3xl bg-white/55 border border-white/85 ${radiusClass} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,1)] p-6 sm:p-10 relative overflow-hidden`;
  }

  const primaryColor = styling.primaryColor || '#ff4f19';

  let buttonInlineStyle: React.CSSProperties = {};
  let buttonClass = `w-full sm:w-auto px-8 py-3 font-bold transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonRadiusClass} `;

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
      boxShadow: `0 8px 25px -4px ${primaryColor}66, inset 0 1.5px 1px rgba(255,255,255,0.4)`,
    };
    buttonClass += 'text-white hover:opacity-95 active:scale-[0.99] border border-white/30 backdrop-blur-md';
  }

  // Input styling
  let baseInputClass = `w-full px-3.5 py-2.5 text-xs sm:text-sm font-sans outline-none transition-all duration-150 ${inputRadiusClass} `;
  if (isDarkTheme) {
    baseInputClass += 'bg-[#181d28] border border-neutral-700 text-white focus:border-brand-orange';
  } else if (isMinimal) {
    baseInputClass += 'bg-neutral-50/80 border border-neutral-300 text-neutral-900 font-mono text-xs placeholder:text-neutral-400 hover:border-neutral-900 focus:border-neutral-900 focus:bg-white';
  } else if (isNeobrutalist) {
    baseInputClass += 'border-2 border-black bg-white text-neutral-900 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
  } else {
    // Liquid Glass
    baseInputClass += 'bg-white/50 backdrop-blur-xl border border-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:bg-white/85 focus:border-white focus:ring-4 focus:ring-brand-orange/20 text-neutral-900 placeholder:text-neutral-400';
  }

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0d1017] text-white' : 'bg-[#fbfbfd] text-neutral-900'} font-sans antialiased flex flex-col justify-between py-10 sm:py-14 px-4 sm:px-6 selection:bg-brand-orange selection:text-white`}>
      <main className="max-w-2xl w-full mx-auto">
        <div className={`${cardClass} transition-all`}>
          <div className={`border-b ${isDarkTheme ? 'border-neutral-800' : 'border-neutral-100'} pb-5 mb-7`}>
            {form.category && (
              <div className="flex items-center mb-2">
                {(() => {
                  const CategoryIcon = categoryIcons[form.category] || Tag;
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
                      <span className="leading-tight">{categoryLabels[form.category] || form.category}</span>
                    </span>
                  );
                })()}
              </div>
            )}
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${titleColor} font-heading`}>
              {form.name}
            </h1>

            {form.description && (
              <p className={`text-xs sm:text-[13px] ${descColor} mt-2 leading-relaxed font-sans`}>
                {form.description}
              </p>
            )}

            <div className={`mt-4 pt-3 border-t ${isDarkTheme ? 'border-neutral-800' : 'border-neutral-100'} flex items-center justify-between text-[11px] ${descColor} font-medium`}>
              <span>Please complete the questions below</span>
              <span><span className="text-red-500">*</span> Required fields</span>
            </div>
          </div>

          {submitted ? (
            <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className={`w-16 h-16 mx-auto rounded-full ${isDarkTheme ? 'bg-emerald-950/50 border-2 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-2 border-emerald-200 text-emerald-600'} flex items-center justify-center mb-5 shadow-sm`}>
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className={`text-2xl font-extrabold ${titleColor} mb-2 font-heading`}>
                Application Submitted
              </h2>
              <p className={`${descColor} text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed`}>
                Thank you! Your information has been securely transmitted and recorded. The team will review your submission shortly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border ${isDarkTheme ? 'border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700' : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'} font-semibold transition-all text-xs w-full sm:w-auto cursor-pointer shadow-2xs`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                  Submit Another Response
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-charcoal hover:bg-black text-white font-semibold transition-all text-xs w-full sm:w-auto shadow-sm"
                >
                  <span>Done</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {form.fields.map((field) => {
                const hasError = !!fieldErrors[field.id];
                const value = formData[field.id] ?? '';

                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className={`flex items-center justify-between text-[13px] font-medium ${labelColor} font-sans`}>
                      <span>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1 font-sans">*</span>}
                      </span>
                    </label>

                    {(field.type === 'text' || field.type === 'email') && (
                      <input
                        type={field.type}
                        value={value}
                        placeholder={field.placeholder || 'Your answer'}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`${baseInputClass} ${
                          hasError
                            ? 'bg-red-50/50 border border-red-300 text-neutral-900 focus:ring-2 focus:ring-red-100'
                            : ''
                        }`}
                        disabled={submitting}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        rows={4}
                        value={value}
                        placeholder={field.placeholder || 'Provide details here...'}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`${baseInputClass} resize-y leading-relaxed ${
                          hasError
                            ? 'bg-red-50/50 border border-red-300 text-neutral-900 focus:ring-2 focus:ring-red-100'
                            : ''
                        }`}
                        disabled={submitting}
                      />
                    )}

                    {field.type === 'select' && (
                      <div className="relative">
                        <select
                          value={value}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`${baseInputClass} pr-10 appearance-none cursor-pointer ${
                            hasError
                              ? 'bg-red-50/50 border border-red-300 text-neutral-900'
                              : ''
                          }`}
                          disabled={submitting}
                        >
                          <option value="" disabled className="text-neutral-400">
                            {field.placeholder || 'Select an option...'}
                          </option>
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt} className="text-neutral-800">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}

                    {field.type === 'radio' && (
                      <div className="space-y-2 pt-0.5">
                        {field.options?.map((opt, idx) => {
                          const isChecked = value === opt;
                          return (
                            <label
                              key={idx}
                              className={`flex items-center gap-3 p-3 transition-all cursor-pointer select-none ${
                                isNeobrutalist
                                  ? `border-2 border-black rounded-none ${isChecked ? 'bg-amber-100/50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`
                                  : isMinimal
                                    ? `border border-neutral-900 rounded-none ${isChecked ? 'bg-neutral-100 font-bold' : 'bg-white'}`
                                    : isDarkTheme
                                      ? `rounded-xl border border-neutral-800 ${isChecked ? 'bg-[#202736] border-brand-orange text-white' : 'bg-[#181d28] text-neutral-200'}`
                                      : `rounded-xl border border-neutral-200 ${isChecked ? 'bg-orange-50/30 border-brand-orange text-neutral-900 font-medium' : 'bg-white text-neutral-700'}`
                              }`}
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={isChecked}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                className="w-4 h-4 accent-brand-orange cursor-pointer"
                                disabled={submitting}
                              />
                              <span className="text-xs sm:text-[13px]">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {field.type === 'checkbox' && (
                      <label
                        className={`flex items-start gap-3 p-3 transition-all cursor-pointer select-none ${
                          isNeobrutalist
                            ? 'border-2 border-black rounded-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : isMinimal
                              ? 'border border-neutral-900 rounded-none bg-white'
                              : isDarkTheme
                                ? 'rounded-xl border border-neutral-800 bg-[#181d28] text-neutral-200'
                                : 'rounded-xl border border-neutral-200 bg-white text-neutral-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleInputChange(field.id, e.target.checked)}
                          className="w-4 h-4 accent-brand-orange rounded mt-0.5 cursor-pointer"
                          disabled={submitting}
                        />
                        <span className="text-xs sm:text-[13px] leading-snug">
                          {field.placeholder || field.label}
                        </span>
                      </label>
                    )}

                    {field.type === 'file' && (
                      <div className={`border border-dashed ${isNeobrutalist ? 'border-2 border-black rounded-none bg-white' : isMinimal ? 'border border-neutral-900 rounded-none bg-neutral-50' : isDarkTheme ? 'border-neutral-700 bg-[#181d28] hover:bg-[#202736] rounded-xl' : 'border-neutral-300 bg-neutral-50 hover:bg-white rounded-xl'} p-4 text-center transition-colors cursor-pointer`}>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleInputChange(field.id, file ? file.name : '');
                          }}
                          className={`text-xs ${isDarkTheme ? 'text-neutral-300' : 'text-neutral-600'} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-black cursor-pointer`}
                          disabled={submitting}
                        />
                      </div>
                    )}

                    {hasError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors[field.id]}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className={`pt-4 border-t ${isDarkTheme ? 'border-neutral-800' : 'border-neutral-100'} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Protected with anti-spam honeypot</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={buttonInlineStyle}
                  className={buttonClass}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <span>Submit Response</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="py-8 text-center">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors shadow-2xs font-medium"
          >
            <SnapFormIcon className="w-3 h-3 text-brand-orange" fill="#ff4f19" />
            Powered by <strong className="text-neutral-900 font-bold">SnapForm</strong>
          </Link>
          <p className="text-[11px] text-neutral-400">
            Never submit confidential credentials through public forms. 256-bit TLS encrypted.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function HostedFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-4" />
          <p className="text-xs font-semibold text-neutral-400">Loading form...</p>
        </div>
      }
    >
      <HostedFormContent />
    </Suspense>
  );
}
