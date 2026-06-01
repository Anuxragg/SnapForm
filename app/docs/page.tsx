'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import {
  FileCode2,
  BookOpen,
  ArrowRight,
  Code,
  Terminal,
  Settings2,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  CheckCircle,
  Copy,
  Check,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Wand2,
} from 'lucide-react';

export default function DocsPage() {
  const { user, logout, openAuthModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'intro' | 'frontend' | 'validation' | 'backend' | 'faq'>('intro');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Code snippet copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections = [
    { id: 'intro', label: '1. Introduction', icon: BookOpen },
    { id: 'frontend', label: '2. React Frontend (Component)', icon: Code },
    { id: 'validation', label: '3. Zod Schema (Validation)', icon: Settings2 },
    { id: 'backend', label: '4. Next.js API (Route)', icon: Terminal },
    { id: 'faq', label: '5. FAQ & Troubleshooting', icon: HelpCircle },
  ];

  const codeSnippets = {
    install: `npm install react-hook-form zod @hookform/resolvers/zod lucide-react`,
    frontendImport: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from './schema'; // import compiled Zod schema

// Within your React Component:
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(FormSchema)
});`,
    zodSchema: `import { z } from 'zod';

export const FormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.enum(['feedback', 'support', 'sales']),
});`,
    routeHandler: `import { NextRequest, NextResponse } from 'next/server';
import { FormSchema } from './schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body client-side schema server-side
    const result = FormSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        errors: result.error.flatten().fieldErrors
      }, { status: 400 });
    }
    
    // Process verified data (e.g. Save to database, send email)
    return NextResponse.json({
      success: true,
      message: 'Form submitted securely!'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Server error parsing body'
    }, { status: 500 });
  }
}`
  };

  return (
    <div className="relative min-h-screen bg-brand-sand text-brand-charcoal font-sans flex flex-col antialiased">
      {/* Subtle paper-like noise grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* sonner notifications */}
      <Toaster position="bottom-right" richColors />

      {/* Global SaaS Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-brand-border/60 bg-brand-sand/40 backdrop-blur-sm">
        <Link href="/">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xl font-black tracking-tight text-brand-charcoal flex items-center gap-0.5">
              <span className="text-brand-orange text-2xl font-extrabold -mt-1">⚡</span>
              snapform
            </span>
            <span className="text-[8px] font-black text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded tracking-widest leading-none font-mono mt-0.5">
              DOCS
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-brand-charcoal/80">
          <Link href="/dashboard" className="hover:text-brand-orange transition-colors">Console</Link>
          <Link href="/builder" className="hover:text-brand-orange transition-colors">Studio</Link>
          <Link href="/docs" className="text-brand-orange">Docs</Link>
        </nav>

        <div className="flex items-center gap-4 relative">
          {!user ? (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-bold text-brand-charcoal/80 hover:text-brand-orange cursor-pointer transition-colors px-3 py-1.5 rounded-full hover:bg-brand-sand-dark"
              >
                Sign In
              </button>
              <Link href="/builder">
                <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2 h-9 shadow-sm border border-brand-orange">
                  Start Building
                </Button>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-brand-border bg-white shadow-sm hover:border-brand-orange/60 hover:shadow transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-orange text-white text-xs font-black flex items-center justify-center shadow-inner">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 mr-1" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-35" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-[#fdfcf9] border border-brand-border rounded-2xl shadow-xl p-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-2 border-b border-brand-border/60 mb-2">
                      <p className="text-[10px] font-black font-mono text-neutral-400 uppercase tracking-widest leading-none">
                        Active Profile
                      </p>
                      <p className="text-xs font-bold text-brand-charcoal truncate mt-1">
                        {user.name}
                      </p>
                      <p className="text-[10px] font-medium text-neutral-500 truncate leading-none mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <Link href="/dashboard" onClick={() => setProfileDropdownOpen(false)}>
                      <button className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand hover:text-brand-orange transition-all cursor-pointer flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5" />
                        Developer Console
                      </button>
                    </Link>

                    <Link href="/builder" onClick={() => setProfileDropdownOpen(false)}>
                      <button className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand hover:text-brand-orange transition-all cursor-pointer flex items-center gap-2 mt-1">
                        <Wand2 className="w-3.5 h-3.5" />
                        Launch Studio
                      </button>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-2 mt-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Docs Layout Grid */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-white border border-brand-border rounded-[2rem] p-5 shadow-sm space-y-4 text-left">
          <p className="text-[9px] font-black font-mono text-neutral-400 uppercase tracking-widest pl-3 leading-none">
            DOCUMENTATION INDEX
          </p>
          <div className="flex flex-col gap-1">
            {sections.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
                    activeSection === sec.id
                      ? 'bg-brand-sand text-brand-orange border border-brand-border/60'
                      : 'text-neutral-500 hover:bg-brand-sand/30 hover:text-brand-charcoal border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeSection === sec.id ? 'text-brand-orange' : 'text-neutral-400'}`} />
                  {sec.label}
                </button>
              );
            })}
          </div>
          
          <div className="border-t border-brand-border/60 pt-4 mt-6 pl-3">
            <Link href="/builder">
              <span className="text-[10px] font-black text-brand-orange hover:underline uppercase flex items-center gap-1 cursor-pointer">
                Jump to Studio <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </span>
            </Link>
          </div>
        </aside>

        {/* Documentation Content Canvas */}
        <section className="lg:col-span-9 bg-white border border-brand-border rounded-[2rem] p-8 md:p-10 shadow-sm text-left min-h-[500px]">
          
          {/* 1. INTRODUCTION SECTION */}
          {activeSection === 'intro' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <span className="text-[9px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded uppercase tracking-wider w-fit block">
                GETTING STARTED
              </span>
              <h1 className="text-3xl font-black text-brand-charcoal tracking-tight">
                Welcome to SnapForm Docs
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                SnapForm compiles ultra-premium, full-stack React forms pre-configured with client-side Zod validators and standard Next.js App Router POST handlers. Our engine exports optimized packages designed to drop directly into your project in milliseconds.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                  {
                    title: 'React & Tailwind UI',
                    desc: 'Clean frontend components built on headless hooks and styled in Tailwind CSS utility classes.',
                    icon: Code,
                  },
                  {
                    title: 'Zod Schemas',
                    desc: 'Robust validation models specifying clean client-side errors and TypeScript type declarations.',
                    icon: Settings2,
                  },
                  {
                    title: 'Next.js App Router',
                    desc: 'Standard NextJS 14+ POST API route handlers designed to parse and verify incoming submissions.',
                    icon: Terminal,
                  }
                ].map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div key={i} className="p-5 border border-brand-border/60 rounded-2xl bg-brand-sand/10 space-y-3">
                      <div className="p-2 rounded-xl bg-brand-sand border border-brand-border/40 text-brand-orange w-fit shadow-inner">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-black text-brand-charcoal">{feat.title}</h3>
                      <p className="text-[11px] text-neutral-400 leading-normal">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6">
                <h3 className="text-base font-black text-brand-charcoal">Quick Project Installation</h3>
                <p className="text-xs text-neutral-500">
                  Ensure you install the following lightweight open-source validation and state management dependencies in your active codebase before using your downloaded form packages:
                </p>
                <div className="bg-brand-charcoal rounded-2xl p-4 font-mono text-xs text-neutral-300 relative flex justify-between items-center group">
                  <code>{codeSnippets.install}</code>
                  <button
                    onClick={() => copyToClipboard(codeSnippets.install, 'install')}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
                  >
                    {copiedId === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. FRONTEND COMPONENT SECTION */}
          {activeSection === 'frontend' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <span className="text-[9px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded uppercase tracking-wider w-fit block">
                FRONTEND ARCHITECTURE
              </span>
              <h1 className="text-3xl font-black text-brand-charcoal tracking-tight">
                React Frontend (`FormComponent.tsx`)
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                The generated component matches React Hook Form hooks linked client-side to Zod resolvers. It is styled entirely using vanilla **Tailwind CSS utilities** and features built-in loading states, visual form error highlighting, and visual toast indicators.
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-black text-brand-charcoal">How it works</h3>
                <div className="bg-brand-charcoal rounded-2xl p-5 font-mono text-xs text-neutral-300 relative overflow-hidden flex flex-col justify-start">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-3 text-[10px] text-neutral-500 uppercase font-black">
                    <span>Integration Import Example</span>
                    <button
                      onClick={() => copyToClipboard(codeSnippets.frontendImport, 'feImport')}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === 'feImport' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre pr-8 select-text">
                    <code>{codeSnippets.frontendImport}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-2.5 pt-4">
                <h3 className="text-sm font-black text-brand-charcoal">Key Integration steps:</h3>
                <ul className="space-y-2 text-xs text-neutral-500 list-disc pl-5 leading-relaxed">
                  <li>
                    Drop <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">FormComponent.tsx</code> and{' '}
                    <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">schema.ts</code> directly in the same folder.
                  </li>
                  <li>
                    Import the package anywhere inside your Next.js <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">/app</code> router.
                    Our UI utilizes standard Client Components (<code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">'use client';</code> directive included).
                  </li>
                  <li>
                    Adjust colors, spacings, or borders inside the Tailwind class tags directly to blend the form perfectly into your application layout.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 3. VALIDATION SCHEMA SECTION */}
          {activeSection === 'validation' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <span className="text-[9px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded uppercase tracking-wider w-fit block">
                ZOD SCHEMAS
              </span>
              <h1 className="text-3xl font-black text-brand-charcoal tracking-tight">
                Zod Schema Validation (`schema.ts`)
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Validation is schema-driven. Zod creates a type-safe object blueprint that instantly enforces string limits, strict email criteria, enum matching, optional status, and custom bounds.
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-black text-brand-charcoal">Compiled Schema Example</h3>
                <div className="bg-brand-charcoal rounded-2xl p-5 font-mono text-xs text-neutral-300 relative overflow-hidden flex flex-col justify-start">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-3 text-[10px] text-neutral-500 uppercase font-black">
                    <span>schema.ts</span>
                    <button
                      onClick={() => copyToClipboard(codeSnippets.zodSchema, 'zodSch')}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === 'zodSch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre pr-8 select-text">
                    <code>{codeSnippets.zodSchema}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-2.5 pt-4">
                <h3 className="text-sm font-black text-brand-charcoal">Benefits of Zod Schemas:</h3>
                <ul className="space-y-2 text-xs text-neutral-500 list-disc pl-5 leading-relaxed">
                  <li>
                    <strong className="font-bold">Shared Types:</strong> Import the exact schema both frontend (<code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">FormComponent.tsx</code>) and backend (<code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">route.ts</code>) to maintain absolute validation symmetry.
                  </li>
                  <li>
                    <strong className="font-bold">Inferred Types:</strong> Easily get type safety declarations using{' '}
                    <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">
                      type FormValues = z.infer&lt;typeof FormSchema&gt;
                    </code>
                    .
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 4. BACKEND ROUTE HANDLER SECTION */}
          {activeSection === 'backend' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <span className="text-[9px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded uppercase tracking-wider w-fit block">
                SERVER HANDLERS
              </span>
              <h1 className="text-3xl font-black text-brand-charcoal tracking-tight">
                Next.js API Handler (`route.ts`)
              </h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                The generated `route.ts` is fully optimized for Next.js 14+ App Router API routes. It accepts POST payloads, executes `safeParse()` server-side to guarantee client requests have not been tampered with, and returns clean response handlers.
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-black text-brand-charcoal">route.ts Handler Blueprint</h3>
                <div className="bg-brand-charcoal rounded-2xl p-5 font-mono text-xs text-neutral-300 relative overflow-hidden flex flex-col justify-start">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800 mb-3 text-[10px] text-neutral-500 uppercase font-black">
                    <span>app/api/submit/route.ts</span>
                    <button
                      onClick={() => copyToClipboard(codeSnippets.routeHandler, 'rtHand')}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === 'rtHand' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre pr-8 select-text">
                    <code>{codeSnippets.routeHandler}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-2.5 pt-4">
                <h3 className="text-sm font-black text-brand-charcoal">Deployment Instructions:</h3>
                <ul className="space-y-2 text-xs text-neutral-500 list-disc pl-5 leading-relaxed">
                  <li>
                    Create a route folder path matching <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">app/api/submit</code> (or any API path you wish).
                  </li>
                  <li>
                    Save the generated <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">route.ts</code> inside that folder, and keep <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">schema.ts</code> placed relatively.
                  </li>
                  <li>
                    Connect database logic (e.g., Prisma or Mongoose models) inside the <code className="bg-brand-sand/50 px-1 py-0.5 rounded font-mono text-[11px]">result.success</code> validation block to save user contacts securely.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 5. FAQ & ACCORDION SECTION */}
          {activeSection === 'faq' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <span className="text-[9px] font-black font-mono bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded uppercase tracking-wider w-fit block">
                HELP CENTER
              </span>
              <h1 className="text-3xl font-black text-brand-charcoal tracking-tight">
                FAQ & Troubleshooting
              </h1>

              <div className="space-y-4 pt-2">
                {[
                  {
                    q: 'How do I add file upload support?',
                    a: 'If your form contains file inputs, ensure you use FormData inside the handleSubmit onSubmit function instead of standard application/json requests in FormComponent.tsx. On the server side, parse the form streams using req.formData().'
                  },
                  {
                    q: 'Can I use this without Next.js?',
                    a: 'Absolutely! The FormComponent.tsx and schema.ts are built on pure, standard React and Zod. You can drop them into Vite, Create React App, or Remix, and simply replace the Next.js API endpoint URL in the POST fetch call with your own server address.'
                  },
                  {
                    q: 'Why am I getting module not found error on resolvers?',
                    a: 'Make sure you install the react-hook-form Zod validation bridge package: npm i @hookform/resolvers. It acts as the pipeline between the schema rules and React state.'
                  },
                  {
                    q: 'How can I change the branding colors dynamically?',
                    a: 'The components use Tailwind CSS colors (e.g. bg-brand-orange). You can change the primary colors locally in the component file by replacing standard color tags, or update your tailwind.config.js theme block to assign customized hex codes to brand classes.'
                  }
                ].map((faq, i) => (
                  <div key={i} className="p-6 border border-brand-border/60 rounded-3xl space-y-2 bg-brand-sand/5">
                    <h4 className="text-xs font-black text-brand-charcoal font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-brand-orange shrink-0" /> {faq.q}
                    </h4>
                    <p className="text-xs text-neutral-500 leading-relaxed pl-5.5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      </main>

      {/* Solid Brand Footer */}
      <footer className="relative z-20 border-t border-brand-border/60 py-8 bg-brand-sand mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <Link href="/">
              <div className="flex items-center gap-1 cursor-pointer">
                <span className="text-lg font-black tracking-tight text-brand-charcoal flex items-center gap-0.5 select-none">
                  <span className="text-brand-orange text-xl font-extrabold -mt-0.5">⚡</span>
                  snapform
                </span>
              </div>
            </Link>
            <p className="text-[10px] font-mono text-neutral-400">
              &copy; {new Date().getFullYear()} SnapForm Studio. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-brand-charcoal/80">
            <Link href="/dashboard" className="hover:text-brand-orange transition-colors">Console</Link>
            <Link href="/builder" className="hover:text-brand-orange transition-colors">Studio</Link>
            <Link href="/docs" className="text-brand-orange">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
