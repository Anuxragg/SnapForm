'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Radio,
  Lock,
  FileCode2,
  Server,
  Fingerprint,
  Gauge,
  Sliders,
  Package,
} from 'lucide-react';
import WorkflowDemo from '@/components/WorkflowDemo';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeShaderBackground from '@/components/HomeShaderBackground';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [terminalTab, setTerminalTab] = useState<'react' | 'nextjs'>('react');
  const [terminalCopied, setTerminalCopied] = useState(false);

  const copyTerminalCode = () => {
    const code = terminalTab === 'react'
      ? `import { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod';\n\nconst FormSchema = z.object({\n  email: z.string().email(),\n  name: z.string().min(2)\n});`
      : `import { NextResponse } from 'next/server';\nimport { FormSchema } from './schema';\n\nexport async function POST(req) {\n  const body = await req.json();\n  const result = FormSchema.safeParse(body);\n  return NextResponse.json({ success: result.success });\n}`;

    navigator.clipboard.writeText(code);
    setTerminalCopied(true);
    setTimeout(() => setTerminalCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans flex flex-col antialiased">
      {/* 100% Pure 3D Shader Gradient Canvas */}
      <HomeShaderBackground />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-20 flex-1 flex flex-col items-center">
        
        {/* Top Centered: High-Impact Typography & Branding */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6 pb-12 sm:pb-16">
          
          {/* Tag & Headline */}
          <div className="space-y-3">
            <span className="text-[11px] font-black font-mono text-brand-orange uppercase tracking-[0.25em] inline-block animate-pulse px-3.5 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/25">
              COMPILER IS SPEED FOR DEV
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight text-white max-w-2xl mx-auto">
              <span className="text-brand-orange">SnapForm </span>
              delivers fast, type-safe React forms.
            </h1>
          </div>

          {/* Subtext description */}
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl mx-auto">
            Stop writing boilerplate input validation. SnapForm compiles premium Next.js layout forms, Zod-backed schemas, and server-side endpoints in real-time. Speed, precision, and robust integrations that don&apos;t flake.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-extrabold px-8 py-3.5 h-12 flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/30 border border-brand-orange hover:scale-105 active:scale-95 transition-all w-full sm:w-auto cursor-pointer">
                Launch Studio <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button variant="outline" className="rounded-full border-white/20 bg-black/50 backdrop-blur-xl text-white text-sm font-bold px-8 h-12 hover:bg-white/15 transition-all w-full sm:w-auto cursor-pointer">
                Explore Features
              </Button>
            </a>
          </div>

        </div>

        {/* Bottom Centered: Animated Workflow Demo */}
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto">
          <WorkflowDemo />
        </div>

      </main>

      {/* ─── SECTION: "Integrate this afternoon" Showcase & Code Terminal ─── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-20 border-t border-white/10 text-center flex flex-col items-center">
        
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
          Integrate <span className="text-brand-orange">this afternoon</span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed mb-12">
          A simple, elegant compiler so you can start capturing form submissions in minutes. It fits right into your code with type-safe schemas for your favorite frontend stacks.
        </p>

        {/* Tabbed dark code terminal */}
        <div className="w-full max-w-5xl mx-auto border border-white/15 bg-black/75 backdrop-blur-2xl rounded-3xl p-5 md:p-6 shadow-2xl text-left relative overflow-hidden">
          {/* Header language tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
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
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-700"
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

      {/* ─── SECTION: Minimal Linear / Resend Style Developer Grid ───────── */}
      <section id="features" className="relative z-10 w-full bg-black/85 backdrop-blur-3xl border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="max-w-2xl mb-16 space-y-3 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Reach users, not <br />
              broken form endpoints
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-normal">
              A developer platform built with strict type safety, zero boilerplate, and robust security safeguards out of the box.
            </p>
          </div>

          {/* 3x3 Clean Minimal Developer Grid (Unboxed, on unified blurred background) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 text-left">
            
            {/* Card 1 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Proactive blocklist tracking
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Be the first to know if malicious payloads or disposable emails target your forms. Built with real-time <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">DNS MX</span> checks and <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">Anti-Spam</span> filters.
              </p>
            </div>

            {/* Card 2 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Faster compilation time
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Compile full-stack forms in milliseconds. Generates standalone <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">TypeScript</span> AST schemas, JSX components, and production-grade handlers.
              </p>
            </div>

            {/* Card 3 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Build confidence with Zod
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Strict schema validation guaranteeing client and server input parity. Protect endpoints against missing fields, type injection, and <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">RFC 5322</span> syntax violations.
              </p>
            </div>

            {/* Card 4 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Managed API endpoints
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Hosted submission URLs that capture responses instantly with integrated live charts, spreadsheet exports, and encrypted <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">MongoDB</span> storage.
              </p>
            </div>

            {/* Card 5 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                DDoS & rate limiter protection
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Sliding-window IP hashing and auto-purging rate limits. Comply with standards and prevent submission flooding with zero external <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">WAF</span> setup.
              </p>
            </div>

            {/* Card 6 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Domain & email monitoring
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Authenticate users securely with 6-digit OTP verification powered by Nodemailer and Gmail SMTP with no mandatory custom domain setup.
              </p>
            </div>

            {/* Card 7 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Dynamic design system
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Select between Modern Glass, Stark Minimal, or Corporate styles. All styled with pure <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">Tailwind CSS</span> and smooth cubic-bezier transitions.
              </p>
            </div>

            {/* Card 8 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Battle-tested session security
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Server-side authentication with encrypted <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">AES-256-GCM</span> HTTP-only cookie tokens, zero token exposure in browser local storage.
              </p>
            </div>

            {/* Card 9 */}
            <div className="space-y-3">
              <div className="w-6 h-6 text-neutral-200">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Zero-configuration exports
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                Export bundled ZIP packages matching standard Next.js directory structure. Drop directly into <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">App Router</span> and start capturing submissions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Minimal Footer */}
      <Footer />
    </div>
  );
}
