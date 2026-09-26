'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronDown,
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
  { id: 'overview', group: 'Getting Started', label: 'Introduction', icon: BookOpen },
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
    const res = await fetch('https://snapform.live/api/form/YOUR_FORM_ID', {
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
<form action="https://snapform.live/api/form/YOUR_FORM_ID" method="POST" class="space-y-4">
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

function NpmIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zm3.526 3.526h13.422v16.948H12v-11.684H8.711v11.684H5.289V3.526z" />
    </svg>
  );
}

function YarnIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.984 2.012c-.544.02-1.092.1-1.615.242-2.14.582-3.774 2.193-4.393 4.32-.387 1.332-.317 2.76.2 4.043l-4.945 9.89a.885.885 0 0 0 .791 1.282h3.578a.885.885 0 0 0 .791-.49l2.19-4.382c1.107.472 2.338.675 3.567.585 3.864-.28 7.07-3.23 7.64-7.03.354-2.355-.42-4.71-2.073-6.305-1.57-1.517-3.67-2.19-5.73-2.155zm.371 1.785c1.472-.025 2.97.457 4.09 1.54 1.18 1.138 1.733 2.82 1.48 4.5-.407 2.715-2.697 4.823-5.457 5.023-.878.064-1.758-.08-2.549-.418l4.47-8.94a.885.885 0 0 0-.791-1.28h-.024c-.407.006-.82.074-1.22.203-1.528.494-2.694 1.644-3.136 3.167-.276.953-.226 1.973.143 2.89l-2.09 4.18c-.854-1.15-1.287-2.58-1.22-4.04.143-3.106 2.62-5.59 5.727-5.787.195-.012.392-.02.586-.038z"/>
    </svg>
  );
}

function BunIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.825 8.78c-.732-2.16-2.565-3.8-4.767-4.26C11.856 4.058 9.57 4.81 7.9 6.46 5.86 8.47 5.06 11.45 5.83 14.2c.6 2.14 2.18 3.88 4.25 4.67 2.07.8 4.45.54 6.28-.69 1.83-1.22 2.94-3.26 2.94-5.48 0-1.32-.42-2.63-1.17-3.71l.69-.21zm-8.3 4.35a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0zm5.84 0a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0z" />
    </svg>
  );
}

function PnpmIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M0 0h6.857v6.857H0V0zm8.571 0h6.858v6.857H8.571V0zm8.572 0H24v6.857h-6.857V0zM8.571 8.571h6.858v6.858H8.571V8.571zm8.572 0H24v6.858h-6.857V8.571zm0 8.572H24V24h-6.857v-6.857zM0 17.143h6.857V24H0v-6.857zm8.571 0h6.858V24H8.571v-6.857z" />
    </svg>
  );
}

function StepPackageBox({ packages, isDev = false }: { packages: string; isDev?: boolean }) {
  const [pm, setPm] = useState<'npm' | 'yarn' | 'bun' | 'pnpm'>('npm');
  const [copied, setCopied] = useState(false);

  const getCommand = (mgr: string) => {
    switch (mgr) {
      case 'pnpm':
        return `pnpm add ${isDev ? '-D ' : ''}${packages}`;
      case 'yarn':
        return `yarn add ${isDev ? '-D ' : ''}${packages}`;
      case 'bun':
        return `bun add ${isDev ? '-d ' : ''}${packages}`;
      default:
        return `npm install ${isDev ? '-D ' : ''}${packages}`;
    }
  };

  const cmd = getCommand(pm);

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    toast.success('Command copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const PM_TABS = [
    { id: 'npm', label: 'npm', icon: NpmIcon },
    { id: 'yarn', label: 'yarn', icon: YarnIcon },
    { id: 'bun', label: 'bun', icon: BunIcon },
    { id: 'pnpm', label: 'pnpm', icon: PnpmIcon },
  ] as const;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-[#2a2a2a] bg-[#f8f8f9] dark:bg-[#141414] overflow-hidden text-xs shadow-2xs">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-200 dark:border-[#222222] bg-neutral-100/70 dark:bg-[#181818]">
        <div className="flex items-center gap-4">
          {PM_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPm(id)}
              className={`flex items-center gap-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                pm === id
                  ? 'text-brand-orange font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${pm === id ? 'text-brand-orange' : 'opacity-70 text-neutral-500 dark:text-neutral-400'}`} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Copy command"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div
        className="p-3.5 font-mono text-[13px] font-normal leading-[19.5px] text-neutral-800 dark:text-[lab(66.128_-0.0000298023_0.0000119209)] overflow-x-auto scrollbar-none"
        style={{ fontFamily: '"JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      >
        <code>{cmd}</code>
      </div>
    </div>
  );
}

function DocNavCards({
  prev,
  next,
  onNavigate,
}: {
  prev?: { id: SectionId; title: string; subtitle: string };
  next?: { id: SectionId; title: string; subtitle: string } | { href: string; title: string; subtitle: string };
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-brand-border/60 dark:border-[#2e2e2e]">
      {prev ? (
        <button
          onClick={() => {
            onNavigate(prev.id);
            document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border border-neutral-200 dark:border-[#282828] bg-[#f8f8f9] dark:bg-[#181818] hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/70 dark:hover:bg-[#202020] transition-colors cursor-pointer text-left shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-brand-charcoal dark:group-hover:text-white transition-colors shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-charcoal dark:text-neutral-100 group-hover:text-brand-orange transition-colors truncate">
              {prev.title}
            </p>
            <p className="text-xs font-normal text-neutral-500 dark:text-[lab(66.128_-0.0000298023_0.0000119209)] truncate">
              {prev.subtitle}
            </p>
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        'href' in next ? (
          <Link
            href={next.href}
            className="group flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl border border-neutral-200 dark:border-[#282828] bg-[#f8f8f9] dark:bg-[#181818] hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/70 dark:hover:bg-[#202020] transition-colors cursor-pointer text-left shadow-2xs"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-charcoal dark:text-neutral-100 group-hover:text-brand-orange transition-colors truncate">
                {next.title}
              </p>
              <p className="text-xs font-normal text-neutral-500 dark:text-[lab(66.128_-0.0000298023_0.0000119209)] truncate">
                {next.subtitle}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-brand-charcoal dark:group-hover:text-white transition-colors shrink-0" />
          </Link>
        ) : (
          <button
            onClick={() => {
              onNavigate(next.id);
              document.getElementById('docs-content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl border border-neutral-200 dark:border-[#282828] bg-[#f8f8f9] dark:bg-[#181818] hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/70 dark:hover:bg-[#202020] transition-colors cursor-pointer text-left shadow-2xs"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-charcoal dark:text-neutral-100 group-hover:text-brand-orange transition-colors truncate">
                {next.title}
              </p>
              <p className="text-xs font-normal text-neutral-500 dark:text-[lab(66.128_-0.0000298023_0.0000119209)] truncate">
                {next.subtitle}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-brand-charcoal dark:group-hover:text-white transition-colors shrink-0" />
          </button>
        )
      ) : null}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [pkgManager, setPkgManager] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [searchFilter, setSearchFilter] = useState('');
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  // Click outside to close copy dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (copyRef.current && !copyRef.current.contains(e.target as Node)) {
        setCopyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyPage = (format: 'markdown' | 'link' = 'markdown') => {
    if (format === 'link') {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Page link copied to clipboard!');
      }
      setCopyDropdownOpen(false);
      return;
    }

    const markdown = `# Introduction

Open-source, type-safe full-stack form compiler and cloud-hosted form engine built with React 19 & Next.js 15+ — on React Hook Form, Zod, and Tailwind CSS.

Wait... it's not just another form builder. I couldn't find form tools with smooth animations, type-safe React 19 code, and dynamic validation without heavyweight runtime bloat, so I built SnapForm — with React 19, Zod, Tailwind CSS, and Next.js.

## The Problem
SnapForm is built by Anurag (Full-Stack Engineer). I see clunky, bloated form builders everywhere, and most solutions force you into proprietary vendor lock-in or fragile webhook setups.

There are tons of form services, but none are truly developer-first for modern React. They charge for every basic submission tier, lack real-time type safety, and output messy code nobody wants in production.

So I'm building a developer-first form platform — open source, clean code, all yours...

## Why SnapForm?
SnapForm solves both ends of the form lifecycle:
- Unapologetically type-safe: Strict Zod schema validation guaranteeing 100% client and server input parity.
- Zero-backend ingestion: Instant REST endpoints ready to receive live responses with MongoDB persistence.
- Clean React 19 output: Handcrafted with React Hook Form, standard Tailwind tokens, and zero proprietary runtime lock-in.
- Built-in spam & bot protection: Sliding-window IP hashing, disposable email MX checks, and auto rate limits.
`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success('Page markdown copied to clipboard!');
    setCopyDropdownOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

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
            style={{ fontFamily: 'Inter, "Inter Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            className="lg:col-span-9 bg-white dark:bg-[#1E1E1E] border border-brand-border dark:border-[#2e2e2e] rounded-3xl p-6 sm:p-9 shadow-sm h-full overflow-y-auto scrollbar-none space-y-6 transition-colors duration-200"
          >

            {/* 1. INTRODUCTION / OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* Header with Title + Copy Page Dropdown */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                      Introduction
                    </h1>

                    {/* Copy Page Action Dropdown */}
                    <div className="relative shrink-0" ref={copyRef}>
                      <button
                        onClick={() => setCopyDropdownOpen(!copyDropdownOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#252525] hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer select-none"
                        title="Copy page contents"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        )}
                        <span>Copy Page</span>
                        <ChevronDown className="w-3 h-3 text-neutral-400" />
                      </button>

                      {copyDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-[#333333] rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                          <button
                            onClick={() => handleCopyPage('markdown')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer text-left"
                          >
                            <Copy className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Copy as Markdown</span>
                          </button>
                          <button
                            onClick={() => handleCopyPage('link')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer text-left"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Copy Page Link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    Open-source, type-safe full-stack form compiler and cloud-hosted form engine built with React 19 & Next.js 15+ — on React Hook Form, Zod, and Tailwind CSS.
                  </p>
                </div>

                {/* Conversational Intro */}
                <div className="text-[14px] font-normal leading-[22.75px] text-neutral-700 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                  <p>
                    Wait... it&apos;s not just another form builder. I couldn&apos;t find form tools with smooth animations, type-safe React 19 code, and dynamic validation without heavyweight runtime bloat, so I built SnapForm — with{' '}
                    <a
                      href="https://react.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                    >
                      React 19 <ExternalLink className="w-3 h-3 inline opacity-70" />
                    </a>
                    {', '}
                    <a
                      href="https://zod.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                    >
                      Zod <ExternalLink className="w-3 h-3 inline opacity-70" />
                    </a>
                    {', '}
                    <a
                      href="https://tailwindcss.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                    >
                      Tailwind CSS <ExternalLink className="w-3 h-3 inline opacity-70" />
                    </a>
                    {' and '}
                    <a
                      href="https://nextjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                    >
                      Next.js 15+ <ExternalLink className="w-3 h-3 inline opacity-70" />
                    </a>
                    .
                  </p>
                </div>

                {/* Section: The Problem */}
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    The Problem
                  </h2>
                  <div className="space-y-3 text-[14px] font-normal leading-[22.75px] text-neutral-700 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    <p>
                      SnapForm is built by{' '}
                      <a
                        href="https://github.com/Anuxragg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                      >
                        Anurag <ExternalLink className="w-3 h-3 inline opacity-70" />
                      </a>{' '}
                      (Full-Stack Engineer). I see clunky, bloated form builders everywhere, and most solutions force you into proprietary vendor lock-in or fragile webhook setups.
                    </p>
                    <p>
                      There are tons of form services, but none are truly developer-first for modern React. They charge for every basic submission tier, lack real-time schema validation, and output messy code nobody wants in production.
                    </p>
                    <p>
                      So I&apos;m building a developer-first form platform — open source, clean code, all yours...
                    </p>
                  </div>
                </div>

                {/* Section: Why SnapForm? */}
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    Why SnapForm?
                  </h2>
                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-700 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    SnapForm solves both ends of the form lifecycle:
                  </p>
                  <ul className="space-y-2.5 my-2 text-[14px] font-normal leading-[22.75px] text-neutral-700 dark:text-[lab(66.128_-0.0000298023_0.0000119209)] pl-1">
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 dark:text-neutral-500 font-bold select-none">•</span>
                      <span>
                        <strong className="text-brand-charcoal dark:text-white font-semibold">Unapologetically type-safe:</strong> Strict Zod schema validation guaranteeing 100% client and server input parity.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 dark:text-neutral-500 font-bold select-none">•</span>
                      <span>
                        <strong className="text-brand-charcoal dark:text-white font-semibold">Zero-backend ingestion:</strong> Instant REST endpoints ready to receive live responses with MongoDB persistence.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 dark:text-neutral-500 font-bold select-none">•</span>
                      <span>
                        <strong className="text-brand-charcoal dark:text-white font-semibold">Clean React 19 output:</strong> Handcrafted with React Hook Form, standard Tailwind tokens, and zero proprietary runtime lock-in.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-neutral-400 dark:text-neutral-500 font-bold select-none">•</span>
                      <span>
                        <strong className="text-brand-charcoal dark:text-white font-semibold">Built-in spam & bot protection:</strong> Sliding-window IP hashing, disposable email MX checks, and auto rate limits.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Navigation Cards */}
                <DocNavCards
                  next={{
                    id: 'installation',
                    title: 'Installation & Setup',
                    subtitle: 'Install dependencies & add components',
                  }}
                  onNavigate={setActiveSection}
                />
              </div>
            )}

            {/* 2. INSTALLATION & SETUP */}
            {activeSection === 'installation' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                
                {/* Header with Title + Copy Page Dropdown */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                      Installation
                    </h1>

                    {/* Copy Page Action Dropdown */}
                    <div className="relative shrink-0" ref={copyRef}>
                      <button
                        onClick={() => setCopyDropdownOpen(!copyDropdownOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#252525] hover:bg-neutral-100 dark:hover:bg-[#2e2e2e] text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer select-none"
                        title="Copy page contents"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        )}
                        <span>Copy Page</span>
                        <ChevronDown className="w-3 h-3 text-neutral-400" />
                      </button>

                      {copyDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-[#333333] rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                          <button
                            onClick={() => handleCopyPage('markdown')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer text-left"
                          >
                            <Copy className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Copy as Markdown</span>
                          </button>
                          <button
                            onClick={() => handleCopyPage('link')}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer text-left"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Copy Page Link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    Install SnapForm dependencies and add form components to your project
                  </p>
                </div>

                {/* Conversational Intro */}
                <div className="text-[14px] font-normal leading-[22.75px] text-neutral-700 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                  <p>
                    SnapForm is plug-and-play. Skip the heavy setup—follow these steps to add beautiful, interactive form components to your Next.js project.
                  </p>
                </div>

                {/* Steps Section */}
                <div className="space-y-6 pt-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    Steps
                  </h2>

                  {/* Vertical Timeline with connecting line */}
                  <div className="space-y-12 relative pl-8 before:absolute before:left-[11px] before:top-3.5 before:bottom-3.5 before:w-[1.5px] before:bg-neutral-200 dark:before:bg-[#2e2e2e]">
                    
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-8 top-0 z-10 w-6 h-6 rounded-[6px] bg-neutral-200/90 dark:bg-[#2a2a2a] border border-neutral-300 dark:border-[#383838] text-brand-charcoal dark:text-neutral-200 text-xs font-bold font-mono flex items-center justify-center select-none shadow-2xs">
                        1
                      </div>

                      <div className="space-y-3.5">
                        <h3 className="text-base font-bold text-brand-charcoal dark:text-white leading-tight">
                          Install Core Dependencies
                        </h3>
                        <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                          React Hook Form, Zod, and Resolvers power every SnapForm component and are required dependencies.
                        </p>
                        <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                          See the{' '}
                          <a
                            href="https://react-hook-form.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                          >
                            React Hook Form installation guide <ExternalLink className="w-3 h-3 inline opacity-70" />
                          </a>
                          .
                        </p>

                        <div className="pt-1.5">
                          <StepPackageBox packages="react-hook-form zod @hookform/resolvers" />
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-8 top-0 z-10 w-6 h-6 rounded-[6px] bg-neutral-200/90 dark:bg-[#2a2a2a] border border-neutral-300 dark:border-[#383838] text-brand-charcoal dark:text-neutral-200 text-xs font-bold font-mono flex items-center justify-center select-none shadow-2xs">
                        2
                      </div>

                      <div className="space-y-3.5">
                        <h3 className="text-base font-bold text-brand-charcoal dark:text-white leading-tight">
                          Setup Tailwind CSS & UI Utilities
                        </h3>
                        <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                          Initialize Tailwind CSS and lucide-react to set up component styling, smooth transitions, and loaders. Skip this if it&apos;s already installed.
                        </p>
                        <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                          See the{' '}
                          <a
                            href="https://tailwindcss.com/docs/guides/nextjs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 decoration-neutral-400 dark:decoration-neutral-600 hover:decoration-brand-orange hover:text-brand-orange transition-colors inline-flex items-center gap-0.5 font-medium text-brand-charcoal dark:text-white"
                          >
                            Tailwind CSS Next.js installation docs <ExternalLink className="w-3 h-3 inline opacity-70" />
                          </a>
                          .
                        </p>

                        <div className="pt-1.5">
                          <StepPackageBox packages="lucide-react clsx tailwind-merge" />
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-8 top-0 z-10 w-6 h-6 rounded-[6px] bg-neutral-200/90 dark:bg-[#2a2a2a] border border-neutral-300 dark:border-[#383838] text-brand-charcoal dark:text-neutral-200 text-xs font-bold font-mono flex items-center justify-center select-none shadow-2xs">
                        3
                      </div>

                      <div className="space-y-3.5">
                        <h3 className="text-base font-bold text-brand-charcoal dark:text-white leading-tight">
                          Add SnapForm Components
                        </h3>
                        <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                          Export form components with the visual builder. Place the generated schema in{' '}
                          <code className="text-xs font-mono text-brand-orange bg-neutral-200/70 dark:bg-[#252525] px-1.5 py-0.5 rounded">
                            schema.ts
                          </code>{' '}
                          and component in{' '}
                          <code className="text-xs font-mono text-brand-orange bg-neutral-200/70 dark:bg-[#252525] px-1.5 py-0.5 rounded">
                            ContactForm.tsx
                          </code>
                          ; it installs and compiles all field dependencies cleanly.
                        </p>

                        <div className="pt-1.5">
                          <div className="rounded-2xl border border-neutral-200 dark:border-[#2a2a2a] bg-[#f8f8f9] dark:bg-[#141414] overflow-hidden text-xs shadow-2xs">
                            <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-200 dark:border-[#222222] bg-neutral-100/70 dark:bg-[#181818]">
                              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold">
                                tsx • Usage Example
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`import { ContactForm } from '@/components/forms/ContactForm';\n\nexport default function Page() {\n  return <ContactForm />;\n}`);
                                  toast.success('Import snippet copied to clipboard');
                                }}
                                className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Copy code"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <pre
                              className="p-3.5 font-mono text-[13px] font-normal leading-[19.5px] text-neutral-800 dark:text-[lab(66.128_-0.0000298023_0.0000119209)] overflow-x-auto scrollbar-none"
                              style={{ fontFamily: '"JetBrains Mono", "JetBrains Mono Fallback", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                            >
                              <code>{`import { ContactForm } from '@/components/forms/ContactForm';\n\nexport default function Page() {\n  return <ContactForm />;\n}`}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Feedback Widget */}
                <div className="flex items-center gap-3 pt-6 border-t border-brand-border/60 dark:border-[#2e2e2e]">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Did you like the content?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFeedback('good');
                        toast.success('Thanks for the positive feedback!');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        feedback === 'good'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'bg-neutral-100 dark:bg-[#252525] border-neutral-200 dark:border-[#333333] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-[#2e2e2e]'
                      }`}
                    >
                      <span>👍</span>
                      <span>Good</span>
                    </button>
                    <button
                      onClick={() => {
                        setFeedback('bad');
                        toast.info('Thanks for your feedback! We will work to improve it.');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        feedback === 'bad'
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold'
                          : 'bg-neutral-100 dark:bg-[#252525] border-neutral-200 dark:border-[#333333] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-[#2e2e2e]'
                      }`}
                    >
                      <span>👎</span>
                      <span>Bad</span>
                    </button>
                  </div>
                </div>

                {/* Navigation Cards */}
                <DocNavCards
                  prev={{
                    id: 'overview',
                    title: 'Introduction',
                    subtitle: 'Overview & full-stack architecture',
                  }}
                  next={{
                    id: 'frontend',
                    title: 'React Component (.tsx)',
                    subtitle: 'Pure React 19 form component with Hook Form',
                  }}
                  onNavigate={setActiveSection}
                />

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
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    React Frontend Component (<code className="text-xl">Component.tsx</code>)
                  </h1>
                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    The exported React component is 100% self-contained with Tailwind classes, real-time client-side error states, and connects seamlessly to your SnapForm ingestion endpoint.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.frontend}
                  filename="components/ContactForm.tsx"
                  language="tsx"
                  showLineNumbers={true}
                />

                {/* Navigation Cards */}
                <DocNavCards
                  prev={{
                    id: 'installation',
                    title: 'Installation & Setup',
                    subtitle: 'Install dependencies & add components',
                  }}
                  next={{
                    id: 'validation',
                    title: 'Zod Validation Schema',
                    subtitle: 'Type-safe schema definitions for client & server',
                  }}
                  onNavigate={setActiveSection}
                />
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    Zod Validation Schema (<code className="text-xl">schema.ts</code>)
                  </h1>
                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    SnapForm translates your visual inputs, string patterns, email formats, and character bounds into strict Zod schemas that run on both client and server.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.zodSchema}
                  filename="lib/schema.ts"
                  language="typescript"
                  showLineNumbers={true}
                />

                <div className="p-4 rounded-2xl bg-brand-sand/60 dark:bg-[#252525] border border-brand-border dark:border-[#333333] text-[13.5px] leading-[22.75px] text-neutral-700 dark:text-neutral-300 space-y-1">
                  <span className="font-bold text-brand-charcoal dark:text-white block">
                    Single Source of Truth
                  </span>
                  <p>
                    By reusing <code className="font-semibold">ContactSchema</code> in both <code className="font-semibold">Component.tsx</code> and your Next.js route handler, validation logic is never duplicated and client/server models never drift out of sync.
                  </p>
                </div>

                {/* Navigation Cards */}
                <DocNavCards
                  prev={{
                    id: 'frontend',
                    title: 'React Component (.tsx)',
                    subtitle: 'Pure React 19 form component',
                  }}
                  next={{
                    id: 'backend',
                    title: 'Next.js App Router Route',
                    subtitle: 'Server route handlers with Zod validation',
                  }}
                  onNavigate={setActiveSection}
                />
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    Next.js App Router Route (<code className="text-xl">route.ts</code>)
                  </h1>
                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    Designed for Next.js 14 & 15 App Router endpoints. It parses JSON payloads safely with Zod server-side before executing database writes or sending email alerts.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.backendRoute}
                  filename="app/api/submit/route.ts"
                  language="typescript"
                  showLineNumbers={true}
                />

                {/* Navigation Cards */}
                <DocNavCards
                  prev={{
                    id: 'validation',
                    title: 'Zod Validation Schema',
                    subtitle: 'Single source of truth validation',
                  }}
                  next={{
                    id: 'html-ingestion',
                    title: 'HTML & Fetch Ingestion',
                    subtitle: 'Direct endpoint ingestion with zero JS',
                  }}
                  onNavigate={setActiveSection}
                />
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-charcoal dark:text-white tracking-tight font-heading">
                    HTML & Fetch Ingestion
                  </h1>
                  <p className="text-[14px] font-normal leading-[22.75px] text-neutral-600 dark:text-[lab(66.128_-0.0000298023_0.0000119209)]">
                    Need to capture submissions from standard HTML forms, Webflow, WordPress, or custom vanilla JavaScript? Simply point your form&apos;s <code className="font-semibold">action</code> to your SnapForm ingestion URL.
                  </p>
                </div>

                <CodeBlock
                  code={CODE_EXAMPLES.htmlSnippet}
                  filename="form.html"
                  language="html"
                  showLineNumbers={true}
                />

                {/* Navigation Cards */}
                <DocNavCards
                  prev={{
                    id: 'backend',
                    title: 'Next.js App Router Route',
                    subtitle: 'Server route handlers with Zod validation',
                  }}
                  next={{
                    href: '/dashboard',
                    title: 'Go to Dashboard',
                    subtitle: 'Manage forms & view live submissions',
                  }}
                  onNavigate={setActiveSection}
                />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
