'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Cpu,
  Layers,
  Zap,
  FileCode2,
  Wand2,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import WorkflowDemo from '@/components/WorkflowDemo';
import { useAuth } from '@/components/AuthProvider';

export default function LandingPage() {
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();
  const [promptInput, setPromptInput] = useState('');
  const [terminalTab, setTerminalTab] = useState<'react' | 'nextjs'>('react');
  const [terminalCopied, setTerminalCopied] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const copyTerminalCode = () => {
    const code = terminalTab === 'react'
      ? `import { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod';\n\nconst FormSchema = z.object({\n  email: z.string().email(),\n  name: z.string().min(2)\n});`
      : `import { NextResponse } from 'next/server';\nimport { FormSchema } from './schema';\n\nexport async function POST(req) {\n  const body = await req.json();\n  const result = FormSchema.safeParse(body);\n  return NextResponse.json({ success: result.success });\n}`;

    navigator.clipboard.writeText(code);
    setTerminalCopied(true);
    setTimeout(() => setTerminalCopied(false), 2000);
  };

  // Speed Prompt pill submit logic
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    router.push(`/builder?prompt=${encodeURIComponent(promptInput.trim())}`);
  };

  return (
    <div className="relative min-h-screen bg-brand-sand text-brand-charcoal overflow-x-hidden font-sans flex flex-col antialiased">
      {/* Subtle paper-like noise grain overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d5d0c5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Groq-Style Premium Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-brand-border/60">
        {/* Left Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-charcoal/80">
          <Link href="/builder" className="hover:text-brand-orange transition-colors">Studio</Link>
          <a href="#features" className="hover:text-brand-orange transition-colors">Features</a>
        </nav>

        {/* Center Logo - Groq style lightning bold lower */}
        <Link href="/">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-2xl font-black tracking-tight text-brand-charcoal flex items-center gap-0.5">
              <span className="text-brand-orange text-3xl font-extrabold -mt-1">⚡</span>
              snapform
            </span>
          </div>
        </Link>

        {/* Right Buttons */}
        <div className="flex items-center gap-4 relative">
          <Link href="/builder" className="text-sm font-semibold text-brand-charcoal/80 hover:text-brand-orange hidden sm:inline-block transition-colors mr-2">
            Studio
          </Link>

          {!user ? (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="text-sm font-bold text-brand-charcoal/80 hover:text-brand-orange cursor-pointer transition-colors px-3 py-1.5 rounded-full hover:bg-brand-sand-dark"
              >
                Sign In
              </button>
              <Link href="/builder">
                <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-2.5 h-10 shadow-sm border border-brand-orange hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  Start Building
                </Button>
              </Link>
            </>
          ) : (
            <div className="relative">
              {/* Profile Avatar Trigger Button */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-brand-border bg-white shadow-sm hover:border-brand-orange/60 hover:shadow transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black flex items-center justify-center shadow-inner">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 mr-1" />
              </button>

              {/* Custom State Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-52 bg-[#fdfcf9] border border-brand-border rounded-2xl shadow-xl p-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-2 border-b border-brand-border/60 mb-2">
                      <p className="text-[10px] font-black font-mono text-neutral-400 uppercase tracking-widest leading-none">
                        Logged in as
                      </p>
                      <p className="text-xs font-bold text-brand-charcoal truncate mt-1">
                        {user.name}
                      </p>
                      <p className="text-[10px] font-medium text-neutral-500 truncate leading-none mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <Link href="/builder" onClick={() => setProfileDropdownOpen(false)}>
                      <button className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-brand-charcoal hover:bg-brand-sand hover:text-brand-orange transition-all cursor-pointer flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5" />
                        Launch Studio
                      </button>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-2 mt-1"
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

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 pb-20 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Animated Workflow Demo */}
          <div className="lg:col-span-6 xl:col-span-7 order-2 lg:order-1">
            <WorkflowDemo />
          </div>

          {/* Right Column: High-Impact Typography & Branding */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-start text-left space-y-5 order-1 lg:order-2">

            {/* INFERENCE IS FUEL styled mono tag */}
            <div className="space-y-1">
              <span className="text-[11px] font-black font-mono text-brand-orange uppercase tracking-[0.25em] block animate-pulse">
                COMPILER IS SPEED FOR DEV
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-brand-charcoal">
                <span className="text-brand-orange">SnapForm </span>
                delivers fast, type-safe React forms.
              </h1>
            </div>

            {/* Subtext description */}
            <p className="text-sm md:text-base text-brand-charcoal/70 leading-relaxed max-w-xl">
              Stop writing boilerplate input validation. SnapForm compiles premium Next.js layout forms, Zod-backed schemas, and server-side endpoints in real-time. Speed, precision, and robust integrations that don&apos;t flake.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/builder">
                <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-extrabold px-8 py-3.5 h-12 flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 border border-brand-orange hover:scale-105 active:scale-95 transition-all w-full sm:w-auto cursor-pointer">
                  Launch Studio <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="rounded-full border-brand-border bg-white text-brand-charcoal text-sm font-bold px-8 h-12 hover:bg-brand-sand-dark transition-all w-full sm:w-auto cursor-pointer">
                  Explore Features
                </Button>
              </a>
            </div>



            {/* Speed Prompt Bar - Black Pill */}
            <div className="relative pt-4">
              <form onSubmit={handlePromptSubmit} className="relative flex items-center p-1.5 rounded-full bg-brand-charcoal shadow-2xl border border-neutral-900 group">
                <span className="text-brand-orange text-base font-extrabold pl-4.5 pr-2.5 select-none font-mono">⚡</span>
                <input
                  type="text"
                  placeholder="TRY THE SPEED OF SNAPFORM..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-neutral-400 font-mono text-xs focus:outline-none focus:ring-0 py-2.5 pr-12"
                />
                <button
                  type="submit"
                  title="Compile Immediately"
                  className="absolute right-1.5 w-9 h-9 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow shadow-brand-orange/20"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </form>
              <span className="text-[9px] font-semibold text-neutral-400 font-mono block text-left mt-2 pl-4">
                Type any form prompt (e.g. &quot;Signup with newsletter checkbox&quot;) to preload in builder.
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* SnapForm Compilation Engine Section */}
      <section id="engine" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-brand-border/60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div className="text-left space-y-6">
            <span className="text-[10px] font-black font-mono text-brand-orange uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-brand-orange/10 w-fit block">
              FULL-STACK CODE GENERATION
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-brand-charcoal tracking-tight">
              The SnapForm Compilation Engine
            </h2>
            <p className="text-sm text-brand-charcoal/70 leading-relaxed">
              SnapForm compiles beautiful, production-ready form suites instantly, providing zero-boilerplate code setups. In milliseconds, our engine generates optimized React frontend components styled in lightweight Tailwind CSS utility classes, type-safe Zod validation schemas, and standard Next.js backend API routes to securely handle form submissions.
            </p>
            <div className="space-y-3 font-mono text-xs text-brand-charcoal/80">
              <div className="flex items-center gap-2">
                <span className="text-brand-orange font-bold">✔</span>
                <span>Production-ready, customizable React components</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-orange font-bold">✔</span>
                <span>Robust, schema-driven Zod client validation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-orange font-bold">✔</span>
                <span>Secure, server-side Next.js route handlers</span>
              </div>
            </div>
          </div>

          {/* Output bundle directory visual card */}
          <div className="flex items-center justify-center p-8 bg-white border border-brand-border rounded-3xl shadow-xl shadow-brand-charcoal/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-brand-orange/5 to-transparent pointer-events-none" />

            {/* Folder structure container */}
            <div className="w-full max-w-xs h-56 bg-brand-charcoal rounded-3xl border border-neutral-800 shadow-2xl p-6 font-mono text-[11px] leading-relaxed text-neutral-300 relative flex flex-col justify-center text-left">
              <div className="absolute top-4 left-6 text-[9px] font-black font-mono text-neutral-500 uppercase tracking-widest">
                ZIP Package Structure
              </div>

              <div className="space-y-3.5 pt-2">
                {/* Zip Root Folder */}
                <div className="flex items-center gap-2 text-brand-orange font-bold text-xs select-none">
                  <span className="text-lg">📁</span>
                  <span>form-bundle.zip</span>
                </div>

                {/* Sub-files */}
                <div className="space-y-2.5 pl-4 border-l border-neutral-800/80 ml-2">

                  {/* React Component */}
                  <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                    <span className="text-emerald-400 select-none text-base">⚛</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white leading-none">FormComponent.tsx</span>
                      <span className="text-[9px] text-neutral-500 font-sans mt-0.5">React Form & Tailwind CSS</span>
                    </div>
                  </div>

                  {/* Zod Validation */}
                  <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                    <span className="text-amber-400 select-none text-base">🛡</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white leading-none">schema.ts</span>
                      <span className="text-[9px] text-neutral-500 font-sans mt-0.5">Zod validation rules</span>
                    </div>
                  </div>

                  {/* Next.js API route */}
                  <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                    <span className="text-cyan-400 select-none text-base">⚡</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white leading-none">route.ts</span>
                      <span className="text-[9px] text-neutral-500 font-sans mt-0.5">Next.js API route handler</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom tag */}
              <div className="absolute bottom-4 right-6 text-[7px] font-mono text-neutral-600 uppercase tracking-wider">
                Ready for production
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Tabbed Code Terminal Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 border-t border-brand-border/60 text-center">
        {/* Start Now centered pill button */}
        <div className="mb-10">
          <Link href="/builder">
            <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-black px-8 py-3.5 h-12 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
              Start Now
            </Button>
          </Link>
        </div>

        {/* Tabbed dark code terminal */}
        <div className="w-full max-w-7xl mx-auto border border-neutral-800 bg-brand-charcoal rounded-3xl p-5 md:p-6 shadow-2xl text-left relative overflow-hidden">
          {/* Header language tabs */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setTerminalTab('react')}
                className={`text-[10px] font-black font-mono tracking-widest transition-all cursor-pointer uppercase pb-1.5 border-b-2 ${terminalTab === 'react'
                    ? 'text-brand-orange border-brand-orange'
                    : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
              >
                REACT COMPONENT
              </button>
              <button
                type="button"
                onClick={() => setTerminalTab('nextjs')}
                className={`text-[10px] font-black font-mono tracking-widest transition-all cursor-pointer uppercase pb-1.5 border-b-2 ${terminalTab === 'nextjs'
                    ? 'text-brand-orange border-brand-orange'
                    : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
              >
                NEXT.JS API ROUTE
              </button>
            </div>

            {/* Copy button */}
            <button
              type="button"
              onClick={copyTerminalCode}
              title="Copy Code"
              className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-700"
            >
              {terminalCopied ? <span className="text-[10px] font-bold text-brand-orange font-mono">COPIED!</span> : <FileCode2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Terminal content */}
          <div className="font-mono text-[11px] md:text-xs leading-relaxed text-neutral-300 overflow-x-auto select-text whitespace-pre py-2 relative flex">
            {/* Line numbers */}
            <div className="text-neutral-600 text-right pr-4 select-none border-r border-neutral-800/80 mr-4 font-mono w-5">
              {Array.from({ length: terminalTab === 'react' ? 8 : 7 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code highlighter elements */}
            <div className="flex-1">
              {terminalTab === 'react' ? (
                <code>
                  <span className="text-pink-500">import</span> &#123; useForm &#125; <span className="text-pink-500">from</span> <span className="text-emerald-400">&apos;react-hook-form&apos;</span>;<br />
                  <span className="text-pink-500">import</span> &#123; zodResolver &#125; <span className="text-pink-500">from</span> <span className="text-emerald-400">&apos;@hookform/resolvers/zod&apos;</span>;<br />
                  <span className="text-pink-500">import</span> &#123; z &#125; <span className="text-pink-500">from</span> <span className="text-emerald-400">&apos;zod&apos;</span>;<br /><br />
                  <span className="text-cyan-400">const</span> <span className="text-amber-400">FormSchema</span> = z.object(&#123;<br />
                  &nbsp;&nbsp;email: z.string().email(),<br />
                  &nbsp;&nbsp;name: z.string().min(<span className="text-purple-400">2</span>)<br />
                  &#125;);
                </code>
              ) : (
                <code>
                  <span className="text-pink-500">import</span> &#123; NextResponse &#125; <span className="text-pink-500">from</span> <span className="text-emerald-400">&apos;next/server&apos;</span>;<br />
                  <span className="text-pink-500">import</span> &#123; FormSchema &#125; <span className="text-pink-500">from</span> <span className="text-emerald-400">&apos;./schema&apos;</span>;<br /><br />
                  <span className="text-pink-500">export async function</span> <span className="text-amber-400">POST</span>(req) &#123;<br />
                  &nbsp;&nbsp;<span className="text-cyan-400">const</span> body = <span className="text-pink-500">await</span> req.json();<br />
                  &nbsp;&nbsp;<span className="text-cyan-400">const</span> result = FormSchema.safeParse(body);<br />
                  &nbsp;&nbsp;<span className="text-pink-500">return</span> NextResponse.json(&#123; success: result.success &#125;);<br />
                  &#125;
                </code>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-brand-border/60">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-16 tracking-tight">
          Supercharge Your Form Development
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Cpu,
              title: '3-Layer Architecture',
              desc: 'Get full production-ready setups matching frontend React components, Zod validation schemas, and Next.js backend API routing handlers.',
              color: 'border-brand-border bg-white shadow-sm'
            },
            {
              icon: Layers,
              title: 'Tailored Styling Themes',
              desc: 'Switch styles instantly between Modern Glassmorphism, Stark Minimalist layouts, or Rigid Business Corporate interfaces matching your product branding.',
              color: 'border-brand-border bg-white shadow-sm'
            },
            {
              icon: Zap,
              title: 'Instant ZIP Exports',
              desc: 'Pack your generation codes instantly in a structured directory matching proper ES6 file imports, ready to drop in and run.',
              color: 'border-brand-border bg-white shadow-sm'
            }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className={`p-8 rounded-3xl border hover:-translate-y-1 transition-all duration-300 ${feat.color} text-left flex flex-col justify-between`}
              >
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl w-fit bg-brand-sand border border-brand-border text-brand-orange shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-brand-charcoal">{feat.title}</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom solid orange CTA Banner */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-brand-orange rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-xl shadow-brand-orange/10 border border-brand-orange">
          {/* Subtle lightning bolt icon */}
          <span className="text-white text-3xl font-black block mb-5 select-none">⚡</span>

          {/* Main Title */}
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
            Build Fast
          </h2>

          {/* Subtitle */}
          <p className="text-white/95 text-xs md:text-sm max-w-xl mx-auto mb-8 font-semibold leading-relaxed">
            Seamlessly compile custom forms starting with just a single text prompt
          </p>

          {/* Try Free centered button */}
          <Link href="/builder">
            <Button className="rounded-full bg-white hover:bg-neutral-100 text-brand-orange text-xs font-black px-8 py-3 h-10 shadow transition-all hover:scale-105 active:scale-95 border-none cursor-pointer">
              Try SnapForm for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-brand-border/60 py-12 bg-brand-sand">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left side: Logo & Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <Link href="/">
              <div className="flex items-center gap-1 cursor-pointer">
                <span className="text-xl font-black tracking-tight text-brand-charcoal flex items-center gap-0.5 select-none">
                  <span className="text-brand-orange text-2xl font-extrabold -mt-1">⚡</span>
                  snapform
                </span>
              </div>
            </Link>
            <p className="text-[11px] font-mono text-neutral-400">
              &copy; {new Date().getFullYear()} SnapForm Studio. All rights reserved.
            </p>
          </div>

          {/* Right side: Functional links only */}
          <div className="flex items-center gap-6 text-xs font-semibold text-brand-charcoal/80">
            <Link href="/builder" className="hover:text-brand-orange transition-colors">Studio</Link>
            <a href="#features" className="hover:text-brand-orange transition-colors">Features</a>
          </div>

        </div>
      </footer>
    </div>
  );
}
