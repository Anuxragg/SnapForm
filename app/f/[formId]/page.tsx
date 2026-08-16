'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { IFormField, IFormStyling } from '@/models/FormTemplate';

interface PublicFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: IFormField[];
  styling: IFormStyling;
  isPredefined?: boolean;
}

export default function HostedFormPage() {
  const params = useParams();
  const formId = params?.formId as string;

  const [form, setForm] = useState<PublicFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form values and validation errors state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch form details
  useEffect(() => {
    if (!formId) return;

    async function loadForm() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/f/${formId}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Form not found');
        }

        setForm(json.data);

        // Prepopulate default values
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
    // Clear error for this field on edit
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
      const res = await fetch(`/api/f/${formId}`, {
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

  const primaryColor = form?.styling?.primaryColor || '#ff4f19';
  const theme = form?.styling?.theme || 'modern';

  // Theme-specific styles
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'minimal':
        return 'bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-sm';
      case 'corporate':
        return 'bg-slate-900 text-slate-100 border border-slate-800 shadow-xl';
      case 'modern':
      default:
        return 'bg-zinc-900/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl shadow-orange-500/5';
    }
  };

  const getInputClass = (hasError: boolean) => {
    const base =
      'w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm outline-none placeholder:text-zinc-500';
    if (hasError) {
      return `${base} bg-red-500/10 border border-red-500/50 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20`;
    }
    switch (theme) {
      case 'minimal':
        return `${base} bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500`;
      case 'corporate':
        return `${base} bg-slate-950 border border-slate-800 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`;
      case 'modern':
      default:
        return `${base} bg-zinc-950/80 border border-white/10 text-white focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20`;
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Loading Form</h3>
            <p className="text-sm text-zinc-400 mt-1">Preparing your interactive form view...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found Screen
  if (error || !form) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Form Not Found</h2>
          <p className="text-sm text-zinc-400 mt-2 mb-6">
            {error || 'The form you are looking for does not exist or has been removed.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all text-sm w-full"
          >
            Go to SnapForm Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative selection:bg-orange-500/30 selection:text-orange-200 py-12 px-4 sm:px-6 flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Form Container */}
        <div className={`rounded-3xl p-6 sm:p-10 transition-all duration-300 ${getThemeWrapperClass()}`}>
          {/* Header */}
          <div className="border-b border-white/10 pb-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}40`,
                }}
              >
                {form.category || 'Form'}
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Form
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {form.name}
            </h1>
            {form.description && (
              <p className="text-sm sm:text-base text-zinc-400 mt-2 leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          {/* SUCCESS VIEW */}
          {submitted ? (
            <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  border: `2px solid ${primaryColor}60`,
                }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
              <p className="text-zinc-300 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
                Your response has been securely submitted and recorded.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-all text-sm w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Submit Another Response
                </button>
                <Link
                  href="/builder"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm w-full sm:w-auto"
                  style={{
                    backgroundColor: primaryColor,
                    color: '#ffffff',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Create Your Own Form
                </Link>
              </div>
            </div>
          ) : (
            /* FORM INPUT VIEW */
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {form.fields.map((field) => {
                const hasError = !!fieldErrors[field.id];
                const value = formData[field.id] ?? '';

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-zinc-200">
                      <span>
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </span>
                    </label>

                    {/* Field Type: Text / Email */}
                    {(field.type === 'text' || field.type === 'email') && (
                      <input
                        type={field.type}
                        value={value}
                        placeholder={field.placeholder || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={getInputClass(hasError)}
                        disabled={submitting}
                      />
                    )}

                    {/* Field Type: Textarea */}
                    {field.type === 'textarea' && (
                      <textarea
                        rows={4}
                        value={value}
                        placeholder={field.placeholder || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={getInputClass(hasError)}
                        disabled={submitting}
                      />
                    )}

                    {/* Field Type: Select Dropdown */}
                    {field.type === 'select' && (
                      <select
                        value={value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={getInputClass(hasError)}
                        disabled={submitting}
                      >
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">
                          {field.placeholder || 'Select an option...'}
                        </option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt} className="bg-zinc-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Field Type: Radio Group */}
                    {field.type === 'radio' && (
                      <div className="space-y-2 pt-1">
                        {field.options?.map((opt, idx) => (
                          <label
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              value === opt
                                ? 'bg-white/5 border-white/30 text-white'
                                : 'bg-zinc-950/40 border-white/5 text-zinc-300 hover:bg-white/[0.02]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={value === opt}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="accent-orange-500 w-4 h-4 cursor-pointer"
                              disabled={submitting}
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Field Type: Checkbox */}
                    {field.type === 'checkbox' && (
                      <label className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleInputChange(field.id, e.target.checked)}
                          className="accent-orange-500 w-4 h-4 rounded mt-0.5 cursor-pointer"
                          disabled={submitting}
                        />
                        <span className="text-sm text-zinc-300 leading-snug">
                          {field.placeholder || field.label}
                        </span>
                      </label>
                    )}

                    {/* Field Type: File */}
                    {field.type === 'file' && (
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleInputChange(field.id, file ? file.name : '');
                        }}
                        className={getInputClass(hasError)}
                        disabled={submitting}
                      />
                    )}

                    {/* Field Validation Error */}
                    {hasError && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {fieldErrors[field.id]}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-base hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 25px -5px ${primaryColor}40`,
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Response...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Form
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Brand */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Powered by <strong className="text-white">SnapForm</strong>
          </Link>
          <p className="text-xs text-zinc-600">
            Never submit passwords or sensitive credentials through public forms.
          </p>
        </div>
      </div>
    </div>
  );
}
