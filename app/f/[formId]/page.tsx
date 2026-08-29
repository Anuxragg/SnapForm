'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import { IFormField, IFormStyling } from '@/models/FormTemplate';
import { SnapFormIcon } from '@/components/Logo';

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

  // Loading Screen
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

  // Error / Not Found Screen
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

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-neutral-900 font-sans antialiased flex flex-col justify-between py-10 sm:py-14 px-4 sm:px-6 selection:bg-brand-orange selection:text-white">
      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto">
        {/* Main White Card Container */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl sm:rounded-3xl shadow-xl shadow-neutral-200/30 p-6 sm:p-10 transition-all">
          {/* Header Section */}
          <div className="border-b border-neutral-100 pb-5 mb-7">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-2.5 py-0.5 text-[10px] font-medium tracking-wide rounded-md bg-neutral-100 text-neutral-600 font-sans uppercase">
                {form.category || 'Inquiry'}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Form
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-heading">
              {form.name}
            </h1>

            {form.description && (
              <p className="text-xs sm:text-[13px] text-neutral-500 mt-2 leading-relaxed font-sans">
                {form.description}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
              <span>Please complete the questions below</span>
              <span><span className="text-red-500">*</span> Required fields</span>
            </div>
          </div>

          {/* SUCCESS VIEW */}
          {submitted ? (
            <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-5 text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900 mb-2 font-heading">
                Application Submitted
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Thank you! Your information has been securely transmitted and recorded. The team will review your submission shortly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold transition-all text-xs w-full sm:w-auto cursor-pointer shadow-2xs"
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
            /* FORM INPUT VIEW */
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
                    <label className="flex items-center justify-between text-[13px] font-medium text-neutral-700 font-sans">
                      <span>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1 font-sans">*</span>}
                      </span>
                    </label>

                    {/* Field Type: Text / Email */}
                    {(field.type === 'text' || field.type === 'email') && (
                      <input
                        type={field.type}
                        value={value}
                        placeholder={field.placeholder || 'Your answer'}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-sans outline-none transition-all duration-150 ${
                          hasError
                            ? 'bg-red-50/50 border border-red-300 text-neutral-900 focus:ring-2 focus:ring-red-100'
                            : 'bg-white border border-neutral-200 hover:border-neutral-300 focus:border-brand-orange focus:ring-2 focus:ring-orange-500/10 text-neutral-800 placeholder:text-neutral-400'
                        }`}
                        disabled={submitting}
                      />
                    )}

                    {/* Field Type: Textarea */}
                    {field.type === 'textarea' && (
                      <textarea
                        rows={4}
                        value={value}
                        placeholder={field.placeholder || 'Provide details here...'}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-sans outline-none transition-all duration-150 resize-y leading-relaxed ${
                          hasError
                            ? 'bg-red-50/50 border border-red-300 text-neutral-900 focus:ring-2 focus:ring-red-100'
                            : 'bg-white border border-neutral-200 hover:border-neutral-300 focus:border-brand-orange focus:ring-2 focus:ring-orange-500/10 text-neutral-800 placeholder:text-neutral-400'
                        }`}
                        disabled={submitting}
                      />
                    )}

                    {/* Field Type: Select Dropdown */}
                    {field.type === 'select' && (
                      <div className="relative">
                        <select
                          value={value}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm font-sans outline-none transition-all duration-150 appearance-none cursor-pointer ${
                            hasError
                              ? 'bg-red-50/50 border border-red-300 text-neutral-900'
                              : 'bg-white border border-neutral-200 hover:border-neutral-300 focus:border-brand-orange focus:ring-2 focus:ring-orange-500/10 text-neutral-800'
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

                    {/* Field Type: Radio Group */}
                    {field.type === 'radio' && (
                      <div className="space-y-2 pt-0.5">
                        {field.options?.map((opt, idx) => {
                          const isChecked = value === opt;
                          return (
                            <label
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-orange-50/30 border-brand-orange text-neutral-900 font-medium'
                                  : 'bg-white hover:bg-neutral-50/80 border-neutral-200 text-neutral-700'
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

                    {/* Field Type: Checkbox */}
                    {field.type === 'checkbox' && (
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => handleInputChange(field.id, e.target.checked)}
                          className="w-4 h-4 accent-brand-orange rounded mt-0.5 cursor-pointer"
                          disabled={submitting}
                        />
                        <span className="text-xs sm:text-[13px] text-neutral-700 leading-snug">
                          {field.placeholder || field.label}
                        </span>
                      </label>
                    )}

                    {/* Field Type: File */}
                    {field.type === 'file' && (
                      <div className="border border-dashed border-neutral-300 rounded-xl p-4 text-center bg-neutral-50 hover:bg-white transition-colors cursor-pointer">
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleInputChange(field.id, file ? file.name : '');
                          }}
                          className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-black cursor-pointer"
                          disabled={submitting}
                        />
                      </div>
                    )}

                    {/* Field Validation Error */}
                    {hasError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium animate-in fade-in duration-150">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors[field.id]}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Submit Action Bar */}
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Protected with anti-spam honeypot</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm bg-brand-charcoal hover:bg-black active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
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

      {/* Professional Brand Footer */}
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
