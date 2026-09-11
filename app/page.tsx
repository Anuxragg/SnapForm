'use client';

import React, { useEffect } from 'react';
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
import LandingFAQ from '@/components/landing/LandingFAQ';

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
}

const FEATURES: FeatureCard[] = [
  {
    icon: ShieldCheck,
    title: 'Proactive blocklist tracking',
    description: (
      <>
        Be the first to know if malicious payloads or disposable emails target your forms. Built with real-time{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">DNS MX</span> checks and{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">Anti-Spam</span> filters.
      </>
    ),
  },
  {
    icon: Gauge,
    title: 'Faster compilation time',
    description: (
      <>
        Compile full-stack forms in milliseconds. Generates standalone{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">TypeScript</span> AST schemas, JSX components, and production-grade handlers.
      </>
    ),
  },
  {
    icon: Fingerprint,
    title: 'Build confidence with Zod',
    description: (
      <>
        Strict schema validation guaranteeing client and server input parity. Protect endpoints against missing fields, type injection, and{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">RFC 5322</span> syntax violations.
      </>
    ),
  },
  {
    icon: Server,
    title: 'Managed API endpoints',
    description: (
      <>
        Hosted submission URLs that capture responses instantly with integrated live charts, spreadsheet exports, and encrypted{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">MongoDB</span> storage.
      </>
    ),
  },
  {
    icon: Radio,
    title: 'DDoS & rate limiter protection',
    description: (
      <>
        Sliding-window IP hashing and auto-purging rate limits. Comply with standards and prevent submission flooding with zero external{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">WAF</span> setup.
      </>
    ),
  },
  {
    icon: Globe,
    title: 'Domain & email monitoring',
    description: (
      <>
        Authenticate users securely with 6-digit OTP verification powered by Nodemailer and Gmail SMTP with no mandatory custom domain setup.
      </>
    ),
  },
  {
    icon: Sliders,
    title: 'Dynamic design system',
    description: (
      <>
        Select between Modern Glass, Stark Minimal, or Corporate styles. All styled with pure{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">Tailwind CSS</span> and smooth cubic-bezier transitions.
      </>
    ),
  },
  {
    icon: Lock,
    title: 'Battle-tested session security',
    description: (
      <>
        Server-side authentication with encrypted{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">AES-256-GCM</span> HTTP-only cookie tokens, zero token exposure in browser local storage.
      </>
    ),
  },
  {
    icon: Package,
    title: 'Zero-configuration exports',
    description: (
      <>
        Export bundled ZIP packages matching standard Next.js directory structure. Drop directly into{' '}
        <span className="underline decoration-dotted decoration-neutral-400 underline-offset-4 text-white font-medium">App Router</span> and start capturing submissions.
      </>
    ),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans flex flex-col antialiased">
      <HomeShaderBackground />
      <Navbar />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-8 sm:pb-16 flex-1 flex flex-col items-center">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 sm:space-y-5 pb-6 sm:pb-10">
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

          <p className="font-subtext text-xs sm:text-[13px] md:text-sm font-normal leading-[20px] sm:leading-[21px] text-white/85 max-w-lg mx-auto drop-shadow-sm">
            Build, validate, and host production-ready React forms in seconds with zero backend hassle.
          </p>

          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 w-full sm:w-auto">
            <Link href="/dashboard">
              <button className="rounded-[7px] sm:rounded-[8px] bg-brand-orange hover:bg-brand-orange-hover text-white text-xs sm:text-[13px] font-semibold px-3.5 sm:px-5 h-8 sm:h-9 flex items-center justify-center shadow-md transition-colors duration-200 cursor-pointer">
                Hosting Form
              </button>
            </Link>
            <Link href="/builder">
              <button className="rounded-[7px] sm:rounded-[8px] bg-neutral-900/90 backdrop-blur-xl border border-white/10 text-white hover:bg-neutral-800/90 text-xs sm:text-[13px] font-semibold px-3.5 sm:px-5 h-8 sm:h-9 shadow-md transition-colors duration-200 flex items-center justify-center cursor-pointer">
                Form Templates
              </button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto">
          <HeroDashboardPreview />
        </div>
      </main>

      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-8 sm:pb-16 border-t border-white/10 text-center flex flex-col items-center">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-[1.15] text-white tracking-tight mb-2.5 sm:mb-4">
          Integrate <span className="text-brand-orange">this afternoon</span>
        </h2>
        <p className="font-subtext text-xs sm:text-[14px] font-normal leading-[20px] sm:leading-[22px] text-white/90 max-w-md mx-auto mb-5 sm:mb-8">
          Explore production-ready form templates with instant type-safe code.
        </p>
        <IntegrateSplitPreview />
      </section>

      <LandingFAQ />

      <section id="features" className="relative z-10 w-full bg-black/85 backdrop-blur-3xl border-t border-white/10 pt-10 sm:pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16 space-y-3 text-left">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.15]">
              Reach users, not <br />
              broken form endpoints
            </h2>
            <p className="font-subtext text-[15px] font-normal leading-[24px] text-neutral-300">
              A developer platform built with strict type safety, zero boilerplate, and robust security safeguards out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 text-left">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="space-y-3">
                  <div className="w-6 h-6 text-neutral-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
