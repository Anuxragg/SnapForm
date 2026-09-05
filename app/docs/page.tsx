'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CodeBlock from '@/components/CodeBlock';
import { Toaster, toast } from 'sonner';
import {
  BookOpen,
  Code2,
  Terminal,
  Settings2,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  Check,
  Copy,
  ArrowRight,
  ExternalLink,
  Search,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  TrendingUp,
} from 'lucide-react';

type SectionId =
  | 'overview'
  | 'installation'
  | 'frontend'
  | 'validation'
  | 'backend'
  | 'html-ingestion';

interface DocSection {
  id: SectionId;
  group: string;
  label: string;
  icon: React.ElementType;
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'overview', group: 'Getting Started', label: 'Overview & Architecture', icon: BookOpen },
  { id: 'installation', group: 'Getting Started', label: 'Installation & Setup', icon: Terminal },
  { id: 'frontend', group: 'Code Generation', label: 'React Component (.tsx)', icon: Code2 },
  { id: 'validation', group: 'Code Generation', label: 'Zod Validation Schema', icon: Settings2 },
  { id: 'backend', group: 'Code Generation', label: 'Next.js App Router Route', icon: Cpu },
  { id: 'html-ingestion', group: 'Code Generation', label: 'HTML / Fetch Ingestion', icon: FileCode2 },
];

const CODE_EXAMPLES = {
  frontend: `"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactSchema, type ContactInput } from './schema';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema)
  });

  const onSubmit = async (data: ContactInput) => {
    const res = await fetch('https://snapform.live/api/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Form submitted successfully!</h4>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Full Name</label>
        <input 
          {...register('fullName')} 
          className="w-full border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-xl text-sm bg-white dark:bg-[#151515] text-brand-charcoal dark:text-white" 
          placeholder="Alex Johnson"
        />
        {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Email Address</label>
        <input 
          {...register('email')} 
          type="email"
          className="w-full border border-neutral-200 dark:border-neutral-800 p-2.5 rounded-xl text-sm bg-white dark:bg-[#151515] text-brand-charcoal dark:text-white" 
          placeholder="alex@company.com"
        />
        {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
      </div>
      <button 
        disabled={isSubmitting} 
        className="bg-[#ff4f19] hover:bg-[#e04312] text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Send Message'}
      </button>
    </form>
  );
}`,
  zodSchema: `import { z } from 'zod';

export const ContactSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  subscribe: z.boolean().optional(),
});

// Infer TypeScript type for maximum type-safety across your components
export type ContactInput = z.infer<typeof ContactSchema>;`,
  backendRoute: `import { NextRequest, NextResponse } from 'next/server';
import { ContactSchema } from '@/lib/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Server-side validation with Zod
    const validation = ContactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        errors: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const validData = validation.data;
    
    // Store in your database or relay to your CRM
    // await db.submissions.create({ data: validData });

    return NextResponse.json({
      success: true,
      submissionId: 'sub_contact_92',
      message: 'Submission received and verified successfully!',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error processing request payload.',
    }, { status: 500 });
  }
}`,
  htmlSnippet: `<!-- Direct HTML Form Ingestion with Zero JavaScript -->
<form action="https://snapform.live/api/f/YOUR_FORM_ID" method="POST" class="space-y-4">
  <div>
    <label for="name">Full Name</label>
    <input type="text" id="name" name="fullName" required placeholder="Alex Johnson" />
  </div>

  <div>
    <label for="email">Email Address</label>
    <input type="email" id="email" name="email" required placeholder="alex@company.com" />
  </div>

  <div>
    <label for="message">Message</label>
    <textarea id="message" name="message" required placeholder="How can we help?"></textarea>
  </div>

  <button type="submit">Submit Form</button>
</form>`,
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [pkgManager, setPkgManager] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredSections = DOC_SECTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.group.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const getInstallCmd = () => {
    const deps = 'react-hook-form zod @hookform/resolvers lucide-react';
    switch (pkgManager) {
      case 'pnpm':
        return `pnpm add ${deps}`;
      case 'yarn':
        return `yarn add ${deps}`;
      case 'bun':
        return `bun add ${deps}`;
      default:
        return `npm install ${deps}`;
    }
  };

  const groups = Array.from(new Set(DOC_SECTIONS.map((s) => s.group)));

  return (
    <div className="relative h-screen bg-brand-sand dark:bg-[#121212] text-brand-charcoal dark:text-neutral-100 font-sans flex flex-col overflow-hidden antialiased transition-colors duration-200">
      {/* Background subtle grain pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <Toaster position="bottom-right" richColors />

      {/* Global Navbar */}
      <Navbar />

      {/* Main Documentation Centered Screen Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-5 flex-1 h-[calc(100vh)] overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden items-stretch">

          {/* ─── Left Sidebar Navigation ──────────────────────────────────── */}
          <aside className="lg:col-span-3 h-full flex flex-col space-y-2.5 overflow-hidden">
            {/* Quick Search */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter documentation..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 h-9 rounded-[8px] bg-white dark:bg-[#252525] border border-[#e5e5e8] dark:border-[#333333] text-[12px] font-medium text-brand-charcoal dark:text-neutral-200 placeholder:text-neutral-400 outline-none focus:border-brand-orange transition-colors shadow-2xs"
              />
            </div>

            {/* Navigation Card */}
            <div className="flex-1 bg-[#f4f4f5] dark:bg-[#1C1C1C] border border-[#e5e5e8] dark:border-[#2a2a2a] rounded-2xl p-2.5 shadow-2xs space-y-3 overflow-y-auto scrollbar-none flex flex-col justify-between transition-colors duration-200">
              <div className="space-y-3">
                {groups.map((groupName) => {
                  const groupSections = filteredSections.filter((s) => s.group === groupName);
                  if (groupSections.length === 0) return null;

                  return (
                    <div key={groupName} className="space-y-1">
                      <div className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-[#a1a1aa]">
                        {groupName}
                      </div>
                      <div className="space-y-0.5">
                        {groupSections.map((sec) => {
                          const Icon = sec.icon;
                          const isActive = activeSection === sec.id;
                          return (
                            <button
                              key={sec.id}
                              onClick={() => {
                                setActiveSection(sec.id);
                                const mainEl = document.getElementById('docs-content-area');
                                if (mainEl) mainEl.scrollTop = 0;
                              }}
                              className={`w-full h-9 flex items-center rounded-[8px] text-[12px] font-medium leading-[16px] transition-colors cursor-pointer text-left px-2.5 gap-2.5 ${
                                isActive
                                  ? 'bg-[#e4e4e7] dark:bg-[#2a2a2a] text-[oklch(0.145_0_0)] dark:text-white font-semibold'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:text-[oklch(0.145_0_0)] dark:hover:text-white hover:bg-[#e8e8eb] dark:hover:bg-neutral-800/70'
                              }`}
                            >
                              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-orange' : 'text-neutral-500 dark:text-neutral-400'}`} />
                              </div>
                              <span className="overflow-hidden whitespace-nowrap truncate">{sec.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ─── Main Content Canvas (Internal Scrolling) ────────────────── */}
          <main
            id="docs-content-area"
            className="lg:col-span-9 bg-white dark:bg-[#1E1E1E] border border-brand-border dark:border-[#2e2e2e] rounded-3xl p-6 sm:p-9 shadow-sm h-full overflow-y-auto scrollbar-none space-y-6 transition-colors duration-200"
          >

            {/* 1. OVERVIEW & ARCHITECTURE */}
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 dark:border-[#2e2e2e] pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                    <span>Getting Started</span>
                    <span>•</span>
                    <span>Architecture</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                    Overview & Full-Stack Architecture
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    SnapForm is a dual-capability form platform: a <strong className="text-brand-charcoal dark:text-white font-semibold">visual full-stack compiler</strong> that generates clean React 19 & Next.js 15+ code, and an <strong className="text-brand-charcoal dark:text-white font-semibold">instant cloud hosted form engine</strong> that collects real responses with zero backend configuration.
                  </p>
                </div>

                {/* 3 Pillars Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-brand-sand/50 dark:bg-[#252525] border border-brand-border dark:border-[#333333] space-y-1.5">
                    <h4 className="text-sm font-bold text-brand-charcoal dark:text-white">Visual & AI Studio</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Visually compose inputs, regex validation, and styling tokens, or generate complete forms instantly from AI prompts.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-sand/50 dark:bg-[#252525] border border-brand-border dark:border-[#333333] space-y-1.5">
                    <h4 className="text-sm font-bold text-brand-charcoal dark:text-white">Zero-Backend Ingestion</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Every form gets a dedicated public responder URL and a direct REST ingestion endpoint ready to capture submissions.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-sand/50 dark:bg-[#252525] border border-brand-border dark:border-[#333333] space-y-1.5">
                    <h4 className="text-sm font-bold text-brand-charcoal dark:text-white">Real-Time Analytics & CSV</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Responses are validated, protected against spam, stored in MongoDB, graphed with live analytics, and exportable to CSV.
                    </p>
                  </div>
                </div>

                {/* Architecture Pipeline Callout */}
                <div className="p-5 rounded-2xl bg-brand-sand/60 dark:bg-[#252525] border border-brand-border dark:border-[#333333] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    <Layers className="w-4 h-4 text-brand-orange" />
                    <span>Full-Stack Compilation Lifecycle</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center pt-1">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-brand-border dark:border-[#333333] shadow-2xs space-y-1">
                      <span className="text-xs font-semibold text-brand-orange block">STAGE 1</span>
                      <p className="text-xs font-bold text-brand-charcoal dark:text-white">Visual / AI Schema</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-brand-border dark:border-[#333333] shadow-2xs space-y-1">
                      <span className="text-xs font-semibold text-brand-orange block">STAGE 2</span>
                      <p className="text-xs font-bold text-brand-charcoal dark:text-white">Strict Zod Validator</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-brand-border dark:border-[#333333] shadow-2xs space-y-1">
                      <span className="text-xs font-semibold text-brand-orange block">STAGE 3</span>
                      <p className="text-xs font-bold text-brand-charcoal dark:text-white">React + Tailwind</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-brand-border dark:border-[#333333] shadow-2xs space-y-1">
                      <span className="text-xs font-semibold text-brand-orange block">STAGE 4</span>
                      <p className="text-xs font-bold text-brand-charcoal dark:text-white">API Route / Cloud Ingest</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('installation');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Installation & Dependencies <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. INSTALLATION & SETUP */}
            {activeSection === 'installation' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 dark:border-[#2e2e2e] pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                    <span>Getting Started</span>
                    <span>•</span>
                    <span>Package Installation</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                    Installation & Dependencies
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    SnapForm exported code packages rely on standard peer dependencies for schema validation, headless state management, and icons.
                  </p>
                </div>

                {/* Package Manager Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-charcoal dark:text-neutral-200">Select package manager:</span>
                    <div className="flex items-center p-1 rounded-xl bg-brand-sand dark:bg-[#252525] border border-brand-border dark:border-[#333333]">
                      {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pm) => (
                        <button
                          key={pm}
                          onClick={() => setPkgManager(pm)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            pkgManager === pm
                              ? 'bg-brand-charcoal dark:bg-white text-white dark:text-black shadow-sm'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-brand-orange dark:hover:text-brand-orange'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CodeBlock
                    code={getInstallCmd()}
                    filename="Terminal"
                    language="bash"
                    showLineNumbers={false}
                  />
                </div>

                {/* Dependency Specs Table */}
                <div className="border border-brand-border dark:border-[#2e2e2e] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-brand-sand/70 dark:bg-[#252525] border-b border-brand-border dark:border-[#2e2e2e] font-semibold text-neutral-500 dark:text-neutral-400 uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Package</th>
                        <th className="p-3">Version</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60 dark:divide-[#2e2e2e] bg-white dark:bg-[#1E1E1E]">
                      <tr>
                        <td className="p-3 font-semibold text-brand-charcoal dark:text-white">react-hook-form</td>
                        <td className="p-3 text-neutral-500 dark:text-neutral-400">^7.50+</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-300">Headless input state management & performant re-renders</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-brand-charcoal dark:text-white">zod</td>
                        <td className="p-3 text-neutral-500 dark:text-neutral-400">^3.22+</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-300">Declarative TypeScript schema definition and error inference</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-brand-charcoal dark:text-white">@hookform/resolvers</td>
                        <td className="p-3 text-neutral-500 dark:text-neutral-400">^3.3+</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-300">Connects Zod validation directly into React Hook Form state</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-brand-charcoal dark:text-white">lucide-react</td>
                        <td className="p-3 text-neutral-500 dark:text-neutral-400">^0.300+</td>
                        <td className="p-3 text-neutral-600 dark:text-neutral-300">Crisp UI action icons, loaders, and status symbols</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('overview');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white cursor-pointer"
                  >
                    ← Overview
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('frontend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: React Component (.tsx) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. REACT COMPONENT (.TSX) */}
            {activeSection === 'frontend' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 dark:border-[#2e2e2e] pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                    <span>Code Generation</span>
                    <span>•</span>
                    <span>Frontend Component</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                    React Frontend Component (<code className="text-xl">Component.tsx</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    The exported React component is 100% self-contained with Tailwind classes, real-time client-side error states, and connects seamlessly to your SnapForm ingestion endpoint.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.frontend}
                  filename="components/ContactForm.tsx"
                  language="tsx"
                  showLineNumbers={true}
                />

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('installation');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white cursor-pointer"
                  >
                    ← Installation
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('validation');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Zod Validation Schema <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. ZOD VALIDATION SCHEMA */}
            {activeSection === 'validation' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 dark:border-[#2e2e2e] pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                    <span>Code Generation</span>
                    <span>•</span>
                    <span>Type-Safe Schemas</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                    Zod Validation Schema (<code className="text-xl">schema.ts</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    SnapForm translates your visual inputs, string patterns, email formats, and character bounds into strict Zod schemas that run on both client and server.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.zodSchema}
                  filename="lib/schema.ts"
                  language="typescript"
                  showLineNumbers={true}
                />

                <div className="p-4 rounded-2xl bg-brand-sand/60 dark:bg-[#252525] border border-brand-border dark:border-[#333333] text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                  <span className="font-bold text-brand-charcoal dark:text-white block">
                    Single Source of Truth
                  </span>
                  <p>
                    By reusing <code className="font-semibold">ContactSchema</code> in both <code className="font-semibold">Component.tsx</code> and your Next.js route handler, validation logic is never duplicated and client/server models never drift out of sync.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('frontend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white cursor-pointer"
                  >
                    ← Frontend Component
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('backend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Next.js App Router Route <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. NEXT.JS APP ROUTER ROUTE */}
            {activeSection === 'backend' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 dark:border-[#2e2e2e] pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                    <span>Code Generation</span>
                    <span>•</span>
                    <span>Server Route Handler</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                    Next.js App Router Route (<code className="text-xl">route.ts</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Designed for Next.js 14 & 15 App Router endpoints. It parses JSON payloads safely with Zod server-side before executing database writes or sending email alerts.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.backendRoute}
                  filename="app/api/submit/route.ts"
                  language="typescript"
                  showLineNumbers={true}
                />

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('validation');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white cursor-pointer"
                  >
                    ← Zod Schema
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('html-ingestion');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: HTML / Fetch Ingestion <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 6. HTML / FETCH INGESTION */}
            {activeSection === 'html-ingestion' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 dark:border-[#2e2e2e] pb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
                    <span>Code Generation</span>
                    <span>•</span>
                    <span>HTML & Fetch Ingestion</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight">
                    HTML & Fetch Ingestion
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Need to capture submissions from standard HTML forms, Webflow, WordPress, or custom vanilla JavaScript? Simply point your form&apos;s <code className="font-semibold">action</code> to your SnapForm ingestion URL.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.htmlSnippet}
                  filename="form.html"
                  language="html"
                  showLineNumbers={true}
                />

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('backend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-brand-charcoal dark:hover:text-white cursor-pointer"
                  >
                    ← Next.js API Route
                  </button>
                  <Link href="/dashboard">
                    <button className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer">
                      Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
