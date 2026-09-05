'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  ShieldCheck,
  Globe,
  Radio,
  Lock,
  Server,
  Fingerprint,
  Gauge,
  Sliders,
  Package,
} from 'lucide-react';
import HeroDashboardPreview from '@/components/HeroDashboardPreview';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeShaderBackground from '@/components/HomeShaderBackground';
import BreathingText from '@/components/fancy/text/breathing-text';
import IntegrateSplitPreview from '@/components/landing/IntegrateSplitPreview';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If user has an active session, redirect directly to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Prevent flash of home page if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans flex flex-col antialiased">
      {/* 100% Pure 3D Shader Gradient Canvas */}
      <HomeShaderBackground />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-20 flex-1 flex flex-col items-center">

        {/* Top Centered: High-Impact Typography & Branding */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 sm:space-y-5 pb-8 sm:pb-12">

          {/* Tag & Headline */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold font-mono text-white/90 uppercase tracking-[0.2em] inline-block animate-pulse px-3 py-0.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
              COMPILER IS SPEED FOR DEV
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-[1.15] tracking-tight text-white max-w-xl mx-auto drop-shadow-md">
              <BreathingText className="text-white">
                SnapForm
              </BreathingText>{' '}
              delivers fast, type-safe React forms.
            </h1>
          </div>

          {/* Subtext description */}
          <p className="font-subtext text-xs sm:text-[13px] md:text-sm font-normal leading-[21px] text-white/85 max-w-lg mx-auto drop-shadow-sm">
            Build, validate, and host production-ready React forms in seconds. Get auto-generated Zod schemas, Next.js API handlers, and instant submission capture with zero backend hassle.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="rounded-[8px] bg-brand-orange hover:bg-brand-orange-hover text-white text-[13px] font-semibold px-5 h-9 flex items-center justify-center shadow-md transition-colors duration-200 w-full sm:w-auto cursor-pointer">
                Hosting Form
              </button>
            </Link>
            <Link href="/builder" className="w-full sm:w-auto">
              <button className="rounded-[8px] bg-neutral-900/90 backdrop-blur-xl border border-white/10 text-white hover:bg-neutral-800/90 text-[13px] font-semibold px-5 h-9 shadow-md transition-colors duration-200 flex items-center justify-center w-full sm:w-auto cursor-pointer">
                Form Templates
              </button>
            </Link>
          </div>

        </div>

        {/* Bottom Centered: Live Dashboard & Submissions Preview */}
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto">
          <HeroDashboardPreview />
        </div>

      </main>

      {/* ─── SECTION: "Integrate this afternoon" Showcase & Code Terminal ─── */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-20 border-t border-white/10 text-center flex flex-col items-center">

        {/* Headline */}
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-[1.15] text-white tracking-tight mb-4">
          Integrate <span className="text-brand-orange">this afternoon</span>
        </h2>

        {/* Subtitle */}
        <p className="font-subtext text-[15px] font-normal leading-[24px] text-white max-w-xl mx-auto mb-12">
          Explore production-ready form templates. Inspect the type-safe code on the left and test the live interactive preview on the right.
        </p>

        {/* Split Screen Code & Interactive Live Form Preview */}
        <IntegrateSplitPreview />
      </section>

      {/* ─── SECTION: Minimal Linear / Resend Style Developer Grid ───────── */}
      <section id="features" className="relative z-10 w-full bg-black/85 backdrop-blur-3xl border-t border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="max-w-2xl mb-16 space-y-3 text-left">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.15]">
              Reach users, not <br />
              broken form endpoints
            </h2>
            <p className="font-subtext text-[15px] font-normal leading-[24px] text-neutral-300">
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
