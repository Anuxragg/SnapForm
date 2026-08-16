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
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Database,
  Search,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileCode2,
} from 'lucide-react';

type SectionId =
  | 'overview'
  | 'installation'
  | 'frontend'
  | 'validation'
  | 'backend'
  | 'hosted-forms'
  | 'submissions'
  | 'rest-api'
  | 'faq';

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
  { id: 'hosted-forms', group: 'Hosted Cloud Platform', label: 'Live Hosted Forms (/f/)', icon: Globe },
  { id: 'submissions', group: 'Hosted Cloud Platform', label: 'Submissions & CSV Export', icon: FileSpreadsheet },
  { id: 'rest-api', group: 'Hosted Cloud Platform', label: 'REST API & Webhooks', icon: Database },
  { id: 'faq', group: 'Reference', label: 'FAQ & Troubleshooting', icon: HelpCircle },
];

const CODE_EXAMPLES = {
  frontend: `"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema, FormValues } from './schema';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
        <h4 className="text-sm font-bold text-emerald-800">Form submitted successfully!</h4>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="text-xs font-bold text-neutral-700">Full Name</label>
        <input {...register('fullName')} className="w-full border p-2.5 rounded-xl text-sm" />
        {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>}
      </div>
      <button disabled={isSubmitting} className="bg-[#ff4f19] text-white px-6 py-2.5 rounded-full font-bold">
        {isSubmitting ? 'Submitting...' : 'Send Message'}
      </button>
    </form>
  );
}`,
  zodSchema: `import { z } from 'zod';

export const FormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  budget: z.enum(['$5k-$10k', '$10k-$25k', '$25k+']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  subscribe: z.boolean().optional(),
});

// Infer TypeScript type for maximum type-safety across components
export type FormValues = z.infer<typeof FormSchema>;`,
  backendRoute: `import { NextRequest, NextResponse } from 'next/server';
import { FormSchema } from '@/lib/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Server-side validation with Zod
    const validation = FormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        errors: validation.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const validData = validation.data;
    
    // Execute database insert, email notification, or CRM webhook
    // await db.submissions.create({ data: validData });

    return NextResponse.json({
      success: true,
      message: 'Submission received and verified successfully!',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error processing request payload.',
    }, { status: 500 });
  }
}`,
  iframeEmbed: `<iframe 
  src="https://snapform.io/f/6a81f2f8c89ceaef91a74277" 
  width="100%" 
  height="600" 
  frameborder="0"
></iframe>`,
  getSchemaJson: `{
  "success": true,
  "data": {
    "name": "Contact Inquiry Form",
    "fields": [
      { "id": "fullName", "type": "text", "label": "Full Name", "required": true },
      { "id": "email", "type": "email", "label": "Email Address", "required": true }
    ],
    "styling": { "theme": "modern", "primaryColor": "#ff4f19" }
  }
}`,
  postSubmissionJson: `// Request Body (JSON):
{
  "fullName": "Sarah Connor",
  "email": "sarah@example.com",
  "message": "Interested in enterprise plan."
}

// Response (200 OK):
{
  "success": true,
  "message": "Thank you! Your submission has been recorded."
}`,
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
    const deps = 'react-hook-form zod @hookform/resolvers/zod lucide-react';
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
    <div className="relative h-screen bg-brand-sand text-brand-charcoal font-sans flex flex-col overflow-hidden antialiased">
      {/* Background grain texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

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
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter documentation..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-brand-border text-xs text-brand-charcoal placeholder:text-neutral-400 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all shadow-sm"
              />
            </div>

            {/* Navigation Card */}
            <div className="flex-1 bg-white border border-brand-border rounded-2xl p-3 shadow-sm space-y-3 overflow-y-auto scrollbar-none flex flex-col justify-between">
              <div className="space-y-3">
                {groups.map((groupName) => {
                  const groupSections = filteredSections.filter((s) => s.group === groupName);
                  if (groupSections.length === 0) return null;

                  return (
                    <div key={groupName} className="space-y-1">
                      <div className="px-2.5 py-0.5 text-[9px] font-black font-mono uppercase tracking-wider text-neutral-400">
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
                              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                isActive
                                  ? 'bg-brand-charcoal text-white shadow-sm scale-[1.01]'
                                  : 'text-neutral-600 hover:bg-brand-sand hover:text-brand-orange'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-orange' : 'text-neutral-400'}`} />
                              <span className="truncate">{sec.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Studio Direct CTA */}
              <div className="pt-2 border-t border-brand-border/60 shrink-0">
                <Link href="/builder">
                  <button className="w-full px-3 py-2 rounded-xl bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-brand-orange/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Form Studio</span>
                  </button>
                </Link>
              </div>
            </div>
          </aside>

          {/* ─── Main Content Canvas (Internal Scrolling) ────────────────── */}
          <main
            id="docs-content-area"
            className="lg:col-span-9 bg-white border border-brand-border rounded-3xl p-6 sm:p-9 shadow-sm h-full overflow-y-auto scrollbar-none space-y-6"
          >

            {/* 1. OVERVIEW & ARCHITECTURE */}
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>GETTING STARTED</span>
                    <span>•</span>
                    <span>ARCHITECTURE</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Overview & Full-Stack Architecture
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    SnapForm is a dual-capability form platform: a <strong className="text-brand-charcoal font-bold">visual full-stack compiler</strong> that generates clean Next.js 14+ code, and an <strong className="text-brand-charcoal font-bold">instant cloud hosted form engine</strong> that collects real responses with zero backend configuration.
                  </p>
                </div>

                {/* 3 Pillars Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-brand-sand/50 border border-brand-border space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-orange font-mono font-bold text-xs shadow-sm">
                      01
                    </div>
                    <h4 className="text-sm font-black text-brand-charcoal">Visual Studio Compiler</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Visually compose inputs, regex validation, and styling tokens. Compiles into type-safe React + Zod code packages.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-sand/50 border border-brand-border space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-orange font-mono font-bold text-xs shadow-sm">
                      02
                    </div>
                    <h4 className="text-sm font-black text-brand-charcoal">Hosted Cloud Forms</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Every form receives a standalone public responder URL (<code className="text-[10px] font-mono bg-white px-1 py-0.5 rounded text-brand-orange">/f/[id]</code>) ready to share with respondents.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-sand/50 border border-brand-border space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-orange font-mono font-bold text-xs shadow-sm">
                      03
                    </div>
                    <h4 className="text-sm font-black text-brand-charcoal">Submissions & CSV</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Submissions are validated, stored securely in MongoDB, viewable in the Developer Console, and exportable to CSV.
                    </p>
                  </div>
                </div>

                {/* Architecture Pipeline Callout */}
                <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-3 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-400">
                    <Layers className="w-4 h-4 text-brand-orange" />
                    <span>FULL-STACK COMPILATION LIFECYCLE</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center pt-2">
                    <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-1">
                      <span className="text-[10px] font-mono text-brand-orange block">STAGE 1</span>
                      <p className="text-xs font-bold">Field Schema</p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-1">
                      <span className="text-[10px] font-mono text-brand-orange block">STAGE 2</span>
                      <p className="text-xs font-bold">Zod Validator</p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-1">
                      <span className="text-[10px] font-mono text-brand-orange block">STAGE 3</span>
                      <p className="text-xs font-bold">React + Tailwind</p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-1">
                      <span className="text-[10px] font-mono text-brand-orange block">STAGE 4</span>
                      <p className="text-xs font-bold">Next.js API Route</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('installation');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Installation & Dependencies <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. INSTALLATION & SETUP */}
            {activeSection === 'installation' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>GETTING STARTED</span>
                    <span>•</span>
                    <span>PACKAGE INSTALLATION</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Installation & Dependencies
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    SnapForm code packages rely on standard peer dependencies for schema validation, headless state management, and icons.
                  </p>
                </div>

                {/* Package Manager Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-charcoal">Select package manager:</span>
                    <div className="flex items-center p-1 rounded-xl bg-brand-sand border border-brand-border">
                      {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pm) => (
                        <button
                          key={pm}
                          onClick={() => setPkgManager(pm)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                            pkgManager === pm
                              ? 'bg-brand-charcoal text-white shadow-sm'
                              : 'text-neutral-600 hover:text-brand-orange'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aceternity Style Code Block */}
                  <CodeBlock
                    code={getInstallCmd()}
                    filename="Terminal"
                    language="bash"
                    showLineNumbers={false}
                  />
                </div>

                {/* Dependency Specs Table */}
                <div className="border border-brand-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-brand-sand/70 border-b border-brand-border font-mono font-bold text-neutral-500 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Package</th>
                        <th className="p-3">Version</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      <tr>
                        <td className="p-3 font-mono font-bold text-brand-charcoal">react-hook-form</td>
                        <td className="p-3 font-mono text-neutral-500">^7.50+</td>
                        <td className="p-3 text-neutral-600">Headless input state management & performant re-renders</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-brand-charcoal">zod</td>
                        <td className="p-3 font-mono text-neutral-500">^3.22+</td>
                        <td className="p-3 text-neutral-600">Declarative TypeScript schema definition and error inference</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-brand-charcoal">@hookform/resolvers</td>
                        <td className="p-3 font-mono text-neutral-500">^3.3+</td>
                        <td className="p-3 text-neutral-600">Connects Zod validation directly into React Hook Form state</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-brand-charcoal">lucide-react</td>
                        <td className="p-3 font-mono text-neutral-500">^0.300+</td>
                        <td className="p-3 text-neutral-600">Crisp UI action icons, loaders, and status symbols</td>
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
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Overview
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('frontend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: React Component (.tsx) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. REACT COMPONENT (.TSX) */}
            {activeSection === 'frontend' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>CODE GENERATION</span>
                    <span>•</span>
                    <span>FRONTEND COMPONENT</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    React Frontend Component (<code className="font-mono text-xl">Component.tsx</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    The exported React component is 100% self-contained with Tailwind classes, real-time client-side error states, and connects seamlessly to your Next.js API route.
                  </p>
                </div>

                {/* Aceternity Style Code Block */}
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
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Installation
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('validation');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Zod Validation Schema <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 4. ZOD VALIDATION SCHEMA */}
            {activeSection === 'validation' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>CODE GENERATION</span>
                    <span>•</span>
                    <span>TYPE-SAFE SCHEMAS</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Zod Validation Schema (<code className="font-mono text-xl">schema.ts</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    SnapForm translates your visual inputs, string patterns, email formats, and character bounds into strict Zod schemas that run on both client and server.
                  </p>
                </div>

                {/* Aceternity Style Code Block */}
                <CodeBlock
                  code={CODE_EXAMPLES.zodSchema}
                  filename="lib/schema.ts"
                  language="typescript"
                  showLineNumbers={true}
                />

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Single Source of Truth
                  </span>
                  <p>
                    By reusing <code className="font-mono font-bold">FormSchema</code> in both <code className="font-mono font-bold">Component.tsx</code> and your Next.js route handler, validation logic is never duplicated and client/server models never drift out of sync.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('frontend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Frontend Component
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('backend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Next.js App Router Route <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. NEXT.JS APP ROUTER ROUTE */}
            {activeSection === 'backend' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>CODE GENERATION</span>
                    <span>•</span>
                    <span>SERVER ROUTE HANDLER</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Next.js App Router Route (<code className="font-mono text-xl">route.ts</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Designed for Next.js 14 & 15 App Router endpoints. It parses JSON payloads safely with Zod server-side before executing database writes or sending email alerts.
                  </p>
                </div>

                {/* Aceternity Style Code Block */}
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
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Zod Schema
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('hosted-forms');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Hosted Public Forms <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 6. HOSTED PUBLIC FORMS (/F/) */}
            {activeSection === 'hosted-forms' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>HOSTED CLOUD PLATFORM</span>
                    <span>•</span>
                    <span>ZERO-CONFIG PUBLIC FORMS</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Live Hosted Forms (<code className="font-mono text-xl">/f/[formId]</code>)
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Don&apos;t want to export or host code yourself? Every form created in SnapForm is instantly deployed to a standalone, responsive public link that you can share with clients or embed in an iframe.
                  </p>
                </div>

                {/* Features of Hosted Forms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-brand-sand/50 border border-brand-border space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-brand-charcoal">Instant Shareable URL</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Forms are accessible at <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded text-brand-orange">https://snapform.io/f/6a81f...</code> with custom accent themes.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-brand-sand/50 border border-brand-border space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-brand-charcoal">Built-in Validation & Anti-Spam</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Validates email formats, character lengths, and required inputs automatically with animated confirmation states.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-brand-charcoal uppercase">Embedding as an iFrame</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    You can embed any hosted form directly inside WordPress, Webflow, Notion, or your custom website:
                  </p>
                  <CodeBlock
                    code={CODE_EXAMPLES.iframeEmbed}
                    filename="embed.html"
                    language="html"
                    showLineNumbers={true}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('backend');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Next.js API Route
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('submissions');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: Submissions & CSV Export <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 7. SUBMISSIONS & CSV EXPORT */}
            {activeSection === 'submissions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>HOSTED CLOUD PLATFORM</span>
                    <span>•</span>
                    <span>DATA & EXPORT</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Submissions Inbox & CSV Export
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Manage incoming responses directly from your SnapForm Developer Console without connecting external spreadsheet plugins.
                  </p>
                </div>

                {/* Submissions Flow Cards */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-brand-border">
                    <div className="w-8 h-8 rounded-xl bg-brand-orange text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-brand-charcoal">Real-Time Data Collection</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Whenever someone fills your live form, the submission payload is saved along with timestamps and client metadata in MongoDB.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-brand-border">
                    <div className="w-8 h-8 rounded-xl bg-brand-orange text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-brand-charcoal">Interactive Responses Modal</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Click the orange <strong>&quot;X Responses&quot;</strong> button on any form card in your Console to review answers in a responsive table.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-brand-border">
                    <div className="w-8 h-8 rounded-xl bg-brand-orange text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-brand-charcoal">1-Click CSV Download</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Export formatted <code className="font-mono text-[10px] bg-brand-sand px-1.5 py-0.5 rounded text-brand-charcoal font-bold">.csv</code> files ready to import directly into Microsoft Excel, Google Sheets, or Airtable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('hosted-forms');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Hosted Forms
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('rest-api');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: REST API Endpoints <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 8. REST API & WEBHOOKS */}
            {activeSection === 'rest-api' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>HOSTED CLOUD PLATFORM</span>
                    <span>•</span>
                    <span>DEVELOPER API</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    REST API Endpoints
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Programmatically query schemas and ingest form submissions via standardized REST HTTP endpoints.
                  </p>
                </div>

                {/* API Endpoint 1: GET Form Schema */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-bold">GET</span>
                    <span className="text-brand-charcoal font-bold">/api/f/[formId]</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Returns the public form schema, fields list, and styling tokens for a given form.
                  </p>
                  <CodeBlock
                    code={CODE_EXAMPLES.getSchemaJson}
                    filename="response.json"
                    language="json"
                    showLineNumbers={true}
                  />
                </div>

                {/* API Endpoint 2: POST Form Submission */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold">POST</span>
                    <span className="text-brand-charcoal font-bold">/api/f/[formId]</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Submits responder answers to the hosted database. Validates all inputs automatically.
                  </p>
                  <CodeBlock
                    code={CODE_EXAMPLES.postSubmissionJson}
                    filename="payload.json"
                    language="json"
                    showLineNumbers={true}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('submissions');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← Submissions & CSV
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('faq');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-extrabold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Next: FAQ & Troubleshooting <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 9. FAQ & TROUBLESHOOTING */}
            {activeSection === 'faq' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-brand-border/60 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase text-brand-orange tracking-widest">
                    <span>REFERENCE</span>
                    <span>•</span>
                    <span>HELP & FAQ</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                    Frequently Asked Questions
                  </h1>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Answers to common setup, deployment, and integration questions.
                  </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white border border-brand-border space-y-1.5">
                    <h4 className="text-sm font-bold text-brand-charcoal">Can I use SnapForm without Next.js?</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Yes! The exported <code className="font-mono text-[10px] bg-brand-sand px-1 py-0.5 rounded">Component.tsx</code> and <code className="font-mono text-[10px] bg-brand-sand px-1 py-0.5 rounded">schema.ts</code> work in any standard React environment (Vite, Remix, Create React App, Astro). Or you can simply use the live hosted URL (<code className="font-mono text-[10px] bg-brand-sand px-1 py-0.5 rounded">/f/[id]</code>) directly.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-brand-border space-y-1.5">
                    <h4 className="text-sm font-bold text-brand-charcoal">How do I add email notifications when a form is submitted?</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      In your downloaded <code className="font-mono text-[10px] bg-brand-sand px-1 py-0.5 rounded">route.ts</code> file, you can drop in <strong>Resend</strong>, <strong>SendGrid</strong>, or <strong>Postmark</strong> in just 3 lines inside the verified <code className="font-mono text-[10px] bg-brand-sand px-1 py-0.5 rounded">validation.success</code> block.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-brand-border space-y-1.5">
                    <h4 className="text-sm font-bold text-brand-charcoal">Are there any limits on hosted submissions?</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      SnapForm hosted forms support unlimited responses, real-time client verification, and 1-click CSV exporting for all saved forms.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-start pt-4">
                  <button
                    onClick={() => {
                      setActiveSection('rest-api');
                      document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-neutral-500 hover:text-brand-charcoal cursor-pointer"
                  >
                    ← REST API Endpoints
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
