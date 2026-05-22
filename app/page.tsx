'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  FileCode2,
  Terminal,
  Server,
  MousePointerClick,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#07070a] text-neutral-100 overflow-clip font-sans flex flex-col">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-radial from-violet-600/10 to-transparent pointer-events-none rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-radial from-indigo-600/10 to-transparent pointer-events-none rounded-full blur-[140px]" />

      {/* Premium Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-800/30">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Form<span className="text-violet-500">Craft</span>
            </span>
            <span className="text-[10px] font-bold text-violet-400/80 block uppercase tracking-widest mt-[-2px]">
              Code Generator
            </span>
          </div>
        </div>
        <Link href="/builder">
          <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-violet-500/10 cursor-pointer">
            Start Building <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800 text-xs font-semibold text-neutral-300 mb-8 animate-fade-in shadow-inner">
          <Badge className="bg-violet-600 text-white text-[10px] uppercase font-bold py-0 px-2 rounded-full border-none">
            New
          </Badge>
          <span>Next.js 14+ App Router & Zod Integration Support</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.08] bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          Generate Production-Ready <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            React Forms
          </span> in Seconds
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          FormCraft is a premium visual form code builder that compiles stunning UI layouts, robust Zod validation schemas, and secure server-side API routes automatically.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/builder">
            <Button size="lg" className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-8 h-14 flex items-center gap-2 shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              Launch Form Builder <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="rounded-2xl border-neutral-850 hover:bg-neutral-900/50 hover:text-white text-neutral-300 font-semibold px-8 h-14 cursor-pointer">
              Explore Features
            </Button>
          </a>
        </div>

        {/* Visual Mock-up Grid */}
        <div className="relative w-full max-w-5xl mx-auto border border-neutral-850 bg-neutral-900/30 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-2xl shadow-violet-500/5 overflow-hidden">
          {/* Overlay shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

          <div className="flex items-center gap-2 mb-4 bg-neutral-900/50 px-4 py-2.5 rounded-xl border border-neutral-850 w-full md:w-fit text-[11px] text-neutral-400 font-semibold">
            <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping mr-1" />
            <span>Interactive Designer & Code Generator Suite</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Mock left */}
            <div className="lg:col-span-5 border border-neutral-850 bg-[#0c0c0e]/80 rounded-2xl p-6 text-left space-y-4">
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4 text-violet-400" /> Visual Assembly
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Full Name', type: 'text', val: 'John Doe' },
                  { label: 'Email Address', type: 'email', val: 'john@example.com' },
                  { label: 'Project Description', type: 'textarea', val: 'We need a gorgeous...' }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400">{item.label}</label>
                    <div className="h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] px-3 flex items-center text-neutral-300">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-8 rounded-lg bg-violet-600 text-white font-bold text-[11px] flex items-center justify-center cursor-pointer hover:bg-violet-700 shadow-md">
                Submit Form
              </div>
            </div>

            {/* Mock right */}
            <div className="lg:col-span-7 border border-neutral-850 bg-[#0c0c0e]/80 rounded-2xl p-6 text-left space-y-4 font-mono text-[10px] text-neutral-400 h-full min-h-[220px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" /> Code Output
                </span>
                <span className="text-[9px] bg-neutral-900 text-emerald-400 px-2 py-0.5 rounded border border-neutral-800">
                  Ready
                </span>
              </div>
              <div className="flex-1 py-2 overflow-x-auto whitespace-pre">
                <span className="text-violet-400">import</span> &#123; useForm &#125; <span className="text-violet-400">from</span> <span className="text-emerald-400">&apos;react-hook-form&apos;</span>;<br />
                <span className="text-violet-400">import</span> &#123; zodResolver &#125; <span className="text-violet-400">from</span> <span className="text-emerald-400">&apos;@hookform/resolvers/zod&apos;</span>;<br />
                <span className="text-violet-400">import</span> &#123; z &#125; <span className="text-violet-400">from</span> <span className="text-emerald-400">&apos;zod&apos;</span>;<br /><br />
                <span className="text-violet-400">export const</span> <span className="text-indigo-400">FormSchema</span> = z.object(&#123;<br />
                &nbsp;&nbsp;fullName: z.string().min(<span className="text-amber-500">2</span>),<br />
                &nbsp;&nbsp;email: z.string().email(),<br />
                &#125;);
              </div>
              <div className="flex items-center justify-between border-t border-neutral-850 pt-2 text-[9px] text-neutral-500">
                <span>Zip bundle output</span>
                <span className="flex items-center gap-1"><FileCode2 className="w-3 h-3" /> FormComponent.tsx, schema.ts, api.ts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-neutral-900/50">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight">
          Supercharge Your Form Development
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Cpu,
              title: '3-Layer Architecture',
              desc: 'Get full production-ready setups matching frontend React component, Zod validation schema, and Next.js backend API routing.',
              color: 'text-violet-500 bg-violet-500/5 border-violet-500/10'
            },
            {
              icon: Layers,
              title: 'Tailored Styling Themes',
              desc: 'Switch styles instantly between Modern, Corporate, or Stark Minimalist layouts matching your unique app aesthetic.',
              color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10'
            },
            {
              icon: Zap,
              title: 'Instant ZIP Exports',
              desc: 'Pack your generation codes instantly in a structured directory matching file imports, ready to drop in and play.',
              color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className={`p-8 rounded-3xl border bg-neutral-900/20 backdrop-blur-sm text-left hover:-translate-y-1 transition-all duration-300 ${feat.color}`}
              >
                <div className="p-3 rounded-2xl w-fit bg-neutral-900 border border-neutral-800 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 text-center mb-16">
        <div className="border border-neutral-850 bg-gradient-to-b from-neutral-900/30 to-neutral-900/10 backdrop-blur-md rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-radial from-violet-500/5 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Build Better Forms Faster
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed">
            Eliminate boilerplate. Select templates, customize validation rules, and export fully functional TypeScript form modules instantly.
          </p>
          <Link href="/builder">
            <Button size="lg" className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 h-12 shadow-lg shadow-violet-500/20 cursor-pointer">
              Launch FormCraft Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <p>&copy; {new Date().getFullYear()} FormCraft Studio. Built with Next.js, Tailwind v4, & shadcn/ui.</p>
      </footer>
    </div>
  );
}
