'use client';

import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Send,
  RefreshCw,
  AlertCircle,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { SnapFormIcon } from '../Logo';

export default function IntegrateSplitPreview() {
  const [activeTab, setActiveTab] = useState<'nextjs' | 'react' | 'schema'>('nextjs');
  const [copied, setCopied] = useState(false);

  // Live Interactive Form State
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@company.com');
  const [subject, setSubject] = useState('Production React Form Integration');
  const [message, setMessage] = useState('We need type-safe form compilation and automated submission capture for our app.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({});

  const validate = () => {
    const errors: { name?: string; email?: string; subject?: string; message?: string } = {};
    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 chars';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email required';
    }
    if (!subject || subject.trim().length < 3) {
      errors.subject = 'Subject required';
    }
    if (!message || message.trim().length < 10) {
      errors.message = 'Must be at least 10 chars';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInteractiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setFormErrors({});
    setName('Alex Johnson');
    setEmail('alex@company.com');
    setSubject('Production React Form Integration');
    setMessage('We need type-safe form compilation and automated submission capture for our app.');
  };

  const codeSnippets = {
    nextjs: `import { NextResponse } from 'next/server';
import { ContactSchema } from './schema';

export async function POST(req: Request) {
  const body = await req.json();
  
  // Strict schema validation with Zod
  const result = ContactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.format() },
      { status: 400 }
    );
  }

  // SnapForm handles storage & MX scoring
  return NextResponse.json({
    success: true,
    submissionId: 'sub_contact_92',
    capturedAt: new Date().toISOString()
  });
}`,
    react: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactSchema, type ContactInput } from './schema';

export function ContactForm() {
  const { register, handleSubmit } =
    useForm<ContactInput>({
      resolver: zodResolver(ContactSchema)
    });

  const onSubmit = async (data: ContactInput) => {
    await fetch('/api/f/contact-starter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3"
    >
      <input {...register('name')} />
      <input {...register('email')} />
      <input {...register('subject')} />
      <textarea {...register('message')} />
      <button>Send Message</button>
    </form>
  );
}`,
    schema: `import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
  honeypot: z.string().optional()
});

export type ContactInput =
  z.infer<typeof ContactSchema>;`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-5 md:p-7 bg-[#F5F4F0] rounded-[24px] sm:rounded-[30px] border border-neutral-300/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] select-none">
      <div
        style={{
          fontFamily:
            'InterVariable, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
        className="w-full bg-white border border-neutral-200/90 rounded-[16px] sm:rounded-[20px] shadow-[0_12px_35px_-8px_rgba(0,0,0,0.12)] overflow-hidden text-neutral-900 flex flex-col text-left"
      >
        {/* ─── Top Studio / File Header Bar ─── */}
        <div className="px-4 sm:px-6 py-3 bg-[#F7F7F6] border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Breadcrumbs & Tab Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-300/80">
              <div className="w-5 h-5 rounded-md bg-neutral-900 flex items-center justify-center text-white shadow-xs">
                <SnapFormIcon className="w-2.5 h-3.5 text-white" fill="#ffffff" />
              </div>
              <span className="text-[12px] font-semibold text-neutral-800">
                SnapForm
              </span>
            </div>

            {/* File Tabs: api/route.ts first, then ContactForm.tsx, then schema.ts */}
            <div className="flex items-center gap-1 bg-neutral-200/60 p-0.5 rounded-lg border border-neutral-300/40">
              <button
                type="button"
                onClick={() => setActiveTab('nextjs')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'nextjs'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FileCode2 className={`w-3 h-3 ${activeTab === 'nextjs' ? 'text-brand-orange' : 'text-neutral-700'}`} />
                api/route.ts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('react')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'react'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Terminal className={`w-3 h-3 ${activeTab === 'react' ? 'text-brand-orange' : 'text-neutral-700'}`} />
                ContactForm.tsx
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schema')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'schema'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <ShieldCheck className={`w-3 h-3 ${activeTab === 'schema' ? 'text-brand-orange' : 'text-neutral-700'}`} />
                schema.ts
              </button>
            </div>
          </div>

          {/* Right: Status Pill & Copy Button */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11.5px] font-medium text-neutral-700 bg-white border border-neutral-200/90 px-2.5 py-1 rounded-md shadow-2xs">
              <svg className="w-3.5 h-3.5 shrink-0 rounded-[2px]" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="2" fill="#007acc" />
                <text
                  x="21"
                  y="20"
                  fill="#ffffff"
                  fontSize="12.5"
                  fontWeight="800"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  textAnchor="end"
                  letterSpacing="-0.5px"
                >
                  TS
                </text>
              </svg>
              <span>TypeScript</span>
            </div>

            <button
              type="button"
              onClick={copyCode}
              title="Copy code snippet"
              className={`group flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer shadow-2xs active:scale-95 select-none ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-neutral-200/90 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50/80 hover:shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in duration-200" />
                  <span className="font-semibold text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Split Grid: Left Code (6 cols) + Right Live UI Form (6 cols) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200/80 items-stretch">
          {/* Left Side: Dark IDE Code Panel (6 cols, zero horizontal scrollbar) */}
          <div className="lg:col-span-6 bg-[#141517] p-4 sm:p-5 font-mono text-xs sm:text-[12px] leading-[1.65] select-text flex flex-col justify-start overflow-hidden">
            <div className="flex items-start overflow-hidden">
              {/* Line Numbers matching code lines exactly */}
              <div className="text-neutral-600 text-right pr-3 select-none border-r border-neutral-800 mr-3 w-5 shrink-0">
                {codeSnippets[activeTab].split('\n').map((_, i) => (
                  <div key={i} className="leading-[1.65]">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Syntax Rendered Code - Guaranteed no horizontal scroll */}
              <pre className="text-neutral-300 flex-1 whitespace-pre font-mono leading-[1.65] overflow-hidden">
                {activeTab === 'react' && (
                  <code>
                    <span className="text-[#e06c75]">import</span> &#123; useForm &#125; <span className="text-[#e06c75]">from</span> <span className="text-[#98c379]">&apos;react-hook-form&apos;</span>;<br />
                    <span className="text-[#e06c75]">import</span> &#123; zodResolver &#125; <span className="text-[#e06c75]">from</span> <span className="text-[#98c379]">&apos;@hookform/resolvers/zod&apos;</span>;<br />
                    <span className="text-[#e06c75]">import</span> &#123; ContactSchema, <span className="text-[#e06c75]">type</span> ContactInput &#125; <span className="text-[#e06c75]">from</span> <span className="text-[#98c379]">&apos;./schema&apos;</span>;<br />
                    <br />
                    <span className="text-[#e06c75]">export function</span> <span className="text-[#e5c07b]">ContactForm</span>() &#123;<br />
                    &nbsp;&nbsp;<span className="text-[#56b6c2]">const</span> &#123; register, handleSubmit &#125; =<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#61afef]">useForm</span>&lt;<span className="text-[#e5c07b]">ContactInput</span>&gt;(&#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;resolver: <span className="text-[#61afef]">zodResolver</span>(ContactSchema)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;);<br />
                    <br />
                    &nbsp;&nbsp;<span className="text-[#56b6c2]">const</span> <span className="text-[#e5c07b]">onSubmit</span> = <span className="text-[#e06c75]">async</span> (data: <span className="text-[#e5c07b]">ContactInput</span>) =&gt; &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e06c75]">await</span> <span className="text-[#61afef]">fetch</span>(<span className="text-[#98c379]">&apos;/api/f/contact-starter&apos;</span>, &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;method: <span className="text-[#98c379]">&apos;POST&apos;</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;headers: &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#98c379]">&apos;Content-Type&apos;</span>: <span className="text-[#98c379]">&apos;application/json&apos;</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;body: JSON.<span className="text-[#61afef]">stringify</span>(data)<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;);<br />
                    &nbsp;&nbsp;&#125;;<br />
                    <br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">return</span> (<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-[#e06c75]">form</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">onSubmit</span>=&#123;<span className="text-[#61afef]">handleSubmit</span>(onSubmit)&#125;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">className</span>=<span className="text-[#98c379]">&quot;space-y-3&quot;</span><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&gt;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-[#e06c75]">input</span> &#123;...<span className="text-[#61afef]">register</span>(<span className="text-[#98c379]">&apos;name&apos;</span>)&#125; /&gt;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-[#e06c75]">input</span> &#123;...<span className="text-[#61afef]">register</span>(<span className="text-[#98c379]">&apos;email&apos;</span>)&#125; /&gt;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-[#e06c75]">input</span> &#123;...<span className="text-[#61afef]">register</span>(<span className="text-[#98c379]">&apos;subject&apos;</span>)&#125; /&gt;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-[#e06c75]">textarea</span> &#123;...<span className="text-[#61afef]">register</span>(<span className="text-[#98c379]">&apos;message&apos;</span>)&#125; /&gt;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-[#e06c75]">button</span>&gt;Send Message&lt;/<span className="text-[#e06c75]">button</span>&gt;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-[#e06c75]">form</span>&gt;<br />
                    &nbsp;&nbsp;);<br />
                    &#125;
                  </code>
                )}

                {activeTab === 'nextjs' && (
                  <code>
                    <span className="text-[#e06c75]">import</span> &#123; NextResponse &#125; <span className="text-[#e06c75]">from</span> <span className="text-[#98c379]">&apos;next/server&apos;</span>;<br />
                    <span className="text-[#e06c75]">import</span> &#123; ContactSchema &#125; <span className="text-[#e06c75]">from</span> <span className="text-[#98c379]">&apos;./schema&apos;</span>;<br />
                    <br />
                    <span className="text-[#e06c75]">export async function</span> <span className="text-[#e5c07b]">POST</span>(req: Request) &#123;<br />
                    &nbsp;&nbsp;<span className="text-[#56b6c2]">const</span> body = <span className="text-[#e06c75]">await</span> req.<span className="text-[#61afef]">json</span>();<br />
                    <br />
                    &nbsp;&nbsp;<span className="text-neutral-500">// Strict schema validation with Zod</span><br />
                    &nbsp;&nbsp;<span className="text-[#56b6c2]">const</span> result = ContactSchema.<span className="text-[#61afef]">safeParse</span>(body);<br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">if</span> (!result.success) &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#e06c75]">return</span> NextResponse.<span className="text-[#61afef]">json</span>(<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123; error: result.error.<span className="text-[#61afef]">format</span>() &#125;,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123; status: <span className="text-[#d19a66]">400</span> &#125;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;);<br />
                    &nbsp;&nbsp;&#125;<br />
                    <br />
                    &nbsp;&nbsp;<span className="text-neutral-500">// SnapForm handles storage &amp; MX scoring</span><br />
                    &nbsp;&nbsp;<span className="text-[#e06c75]">return</span> NextResponse.<span className="text-[#61afef]">json</span>(&#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;success: <span className="text-[#d19a66]">true</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;submissionId: <span className="text-[#98c379]">&apos;sub_contact_92&apos;</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;capturedAt: <span className="text-[#e06c75]">new</span> <span className="text-[#61afef]">Date</span>().<span className="text-[#61afef]">toISOString</span>()<br />
                    &nbsp;&nbsp;&#125;);<br />
                    &#125;
                  </code>
                )}

                {activeTab === 'schema' && (
                  <code>
                    <span className="text-[#e06c75]">import</span> &#123; z &#125; <span className="text-[#e06c75]">from</span> <span className="text-[#98c379]">&apos;zod&apos;</span>;<br />
                    <br />
                    <span className="text-[#e06c75]">export const</span> <span className="text-[#e5c07b]">ContactSchema</span> = z.<span className="text-[#61afef]">object</span>(&#123;<br />
                    &nbsp;&nbsp;name: z.<span className="text-[#61afef]">string</span>().<span className="text-[#61afef]">min</span>(<span className="text-[#d19a66]">2</span>),<br />
                    &nbsp;&nbsp;email: z.<span className="text-[#61afef]">string</span>().<span className="text-[#61afef]">email</span>(),<br />
                    &nbsp;&nbsp;subject: z.<span className="text-[#61afef]">string</span>().<span className="text-[#61afef]">min</span>(<span className="text-[#d19a66]">3</span>),<br />
                    &nbsp;&nbsp;message: z.<span className="text-[#61afef]">string</span>().<span className="text-[#61afef]">min</span>(<span className="text-[#d19a66]">10</span>),<br />
                    &nbsp;&nbsp;honeypot: z.<span className="text-[#61afef]">string</span>().<span className="text-[#61afef]">optional</span>()<br />
                    &#125;);<br />
                    <br />
                    <span className="text-[#e06c75]">export type</span> <span className="text-[#56b6c2]">ContactInput</span> =<br />
                    &nbsp;&nbsp;z.<span className="text-[#61afef]">infer</span>&lt;<span className="text-[#e06c75]">typeof</span> ContactSchema&gt;;
                  </code>
                )}
              </pre>
            </div>
          </div>

          {/* Right Side: Elongated & Well-Balanced Live UI Form (6 cols) */}
          <div className="lg:col-span-6 p-5 sm:p-6 bg-[#FCFCFB] flex flex-col justify-between">
            <div className="flex-1 flex flex-col">
              {/* Form Title & Metric Status */}
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-neutral-200/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                  <span className="text-sm sm:text-[15px] font-bold text-neutral-900 tracking-tight">
                    Contact Inquiry Form
                  </span>
                </div>

              </div>

              {submitSuccess ? (
                /* Success State (Clean Studio Aesthetic) */
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                  <h4 className="text-[17px] font-bold text-neutral-900 tracking-tight">Submission Delivered</h4>

                  {/* Clean Submission Summary Card */}
                  <div className="w-full bg-white border border-neutral-200/90 rounded-xl p-4 text-left text-xs space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 text-[11px] font-semibold">
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Captured Form Data</span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Stored · 38ms
                      </span>
                    </div>

                    <div className="space-y-2 text-neutral-700 text-[12px]">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-neutral-400 text-[11.5px] shrink-0">Name:</span>
                        <span className="font-semibold text-neutral-900 truncate">{name || 'Alex Johnson'}</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-neutral-400 text-[11.5px] shrink-0">Email:</span>
                        <span className="font-medium text-neutral-800 truncate">{email || 'alex@company.com'}</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-neutral-400 text-[11.5px] shrink-0">Subject:</span>
                        <span className="font-medium text-neutral-800 truncate">{subject || 'General Inquiry'}</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-neutral-400 text-[11.5px] shrink-0">Message:</span>
                        <span className="font-normal text-neutral-600 truncate max-w-[200px]">{message || 'Inquiry message'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-white border border-neutral-200 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-50/80 hover:border-neutral-300 shadow-2xs text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Test another submission</span>
                  </button>
                </div>
              ) : (
                /* Interactive Form Fields - Filling full height */
                <form onSubmit={handleInteractiveSubmit} className="flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-3.5 flex-1 flex flex-col">
                    {/* Full Name & Email Row (Side by side on sm) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Full Name Field */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs sm:text-[12.5px] font-semibold text-neutral-700">
                            Full Name <span className="text-brand-orange">*</span>
                          </label>
                          {formErrors.name && (
                            <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {formErrors.name}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                          }}
                          placeholder="Alex Johnson"
                          className={`w-full text-xs sm:text-[13px] bg-white border ${
                            formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-brand-orange'
                          } rounded-md px-3.5 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 shadow-2xs transition-colors`}
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs sm:text-[12.5px] font-semibold text-neutral-700">
                            Work Email <span className="text-brand-orange">*</span>
                          </label>
                          {formErrors.email && (
                            <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {formErrors.email}
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                          }}
                          placeholder="you@company.com"
                          className={`w-full text-xs sm:text-[13px] bg-white border ${
                            formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-brand-orange'
                          } rounded-md px-3.5 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 shadow-2xs transition-colors`}
                        />
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-[12.5px] font-semibold text-neutral-700">
                          Subject <span className="text-brand-orange">*</span>
                        </label>
                        {formErrors.subject && (
                          <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {formErrors.subject}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value);
                          if (formErrors.subject) setFormErrors({ ...formErrors, subject: undefined });
                        }}
                        placeholder="e.g. Next.js Form Validation"
                        className={`w-full text-xs sm:text-[13px] bg-white border ${
                          formErrors.subject ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-brand-orange'
                        } rounded-md px-3.5 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 shadow-2xs transition-colors`}
                      />
                    </div>

                    {/* Message Field (Flexes to fill remaining vertical height) */}
                    <div className="space-y-1 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <label className="text-xs sm:text-[12.5px] font-semibold text-neutral-700">
                          Message <span className="text-brand-orange">*</span>
                        </label>
                        {formErrors.message && (
                          <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {formErrors.message}
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          if (formErrors.message) setFormErrors({ ...formErrors, message: undefined });
                        }}
                        placeholder="Describe your inquiry in detail..."
                        className={`w-full flex-1 min-h-[120px] text-xs sm:text-[13px] bg-white border ${
                          formErrors.message ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-brand-orange'
                        } rounded-md px-3.5 py-2.5 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-orange/20 shadow-2xs transition-colors resize-none leading-relaxed`}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-md bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Validating Schema...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Status bar matching hero preview footer */}
            <div className="pt-3.5 mt-4 border-t border-neutral-200/70 flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Sync
              </span>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
